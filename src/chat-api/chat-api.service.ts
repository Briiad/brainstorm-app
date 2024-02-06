import { Injectable } from '@nestjs/common';
import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import { Neo4jService } from 'src/neo4j/neo4j.service';

@Injectable()
export class ChatApiService {
  private readonly chat: OpenAIClient;
  // LLM Response will be stored here and deleted if user asks for another question.
  private answer: string;
  private question: string;

  constructor(private readonly neo4jservice: Neo4jService){
    const endpoint = process.env.OPENAI_ENDPOINT;
    this.chat = new OpenAIClient(
      endpoint,
      new AzureKeyCredential(process.env.OPENAI_API_KEY)
    );
  }

  // Get AI response
  async getResponse(question: string){
    const params = {
      "temperature": 1.1,
      "max_tokens": 128,
      "top_p": 1,
      "frequency_penalty": 0.0,
      "presence_penalty": 0.6,
    }

    try{
      const res = await this.chat.getChatCompletions(process.env.OPENAI_DEPLOY_NAME, [
        {role: "system", content: "You are the best assistant i can ever imagine. You answer all my questions with simple, concise and accurate answers."},
        {role: "system", content: "Make sure to answer without any numeric lists or bullet points. NO LIST FORMAT ALLOWED. PARAGRAPH FORMAT ONLY. MAXIMUM 64 WORDS."},
        {role: "user", content: question},
      ], params)
      const ans = res.choices[0].message
      this.answer = ans.content
      this.question = question
      return ans
    } catch(error) {
      return error
    }
  }

  // LLM Response will be converted to knowledge graph using LLM itself.
  async convertGraph(response: string){
    response = this.answer
    try{
      const res = await this.chat.getChatCompletions(process.env.OPENAI_DEPLOY_NAME, [
        {role: "system", content: "##Overview: You are a top-tier algorithm designed for extracting information in structured formats to build a knowledge graph for Neo4J Graph Database. Your answer always straightforward and concise, without adding ANY conversational context."},

        {role: "system", content: "- Extract information from input by defining nodes and edges with maximum 2 words."},
        {role: "system", content: '- The information converted to file.json with the following format: [{"source": , "relation": , "target": }],'},

        {role: "user", content: "Follow the given format or you will be terminated."},
        {role: "user", content: `Use the given format to extract information from the following input: ${response}`},
      ])
      const ans = res.choices[0].message.content

      // Convert to JSON and make it a file.json
      const fs = require('fs');
      fs.writeFileSync('file.json', ans);

      return ans

    } catch(error) {
      return error
    } finally {
      // Read the file.json and return it as a string
      const fs = require('fs');
      const data = fs.readFileSync('file.json', 'utf8');
      
      // Iterate through the JSON 
      const json = JSON.parse(data);
      let output = []
      for (let i = 0; i < json.length; i++) {
        output.push([[`${json[i].source}`], [`${json[i].relation}`], [`${json[i].target}`]])
      }
      
      if (output.length > 0) {
        for (let i = 0; i < output.length; i++) {

          // space and special characters turned to underscore
          let node1 = output[i][0][0].toUpperCase().replace(/\s/g, '_').replace(/[^a-zA-Z0-9_]/g, '_')
          let node2 = output[i][2][0].toUpperCase().replace(/\s/g, '_').replace(/[^a-zA-Z0-9_]/g, '_')
          let edge = output[i][1][0].toString().toUpperCase().replace(/\s/g, '_').replace(/[^a-zA-Z0-9_]/g, '_')

          // Built the graph with branches
          const query = `
          MERGE (n1: Source_Keywords {name: "${node1}"})
          MERGE (n2: Target_Keywords {name: "${node2}"})
          MERGE (n1)-[:${edge}]->(n2)
          RETURN n1, n2
          `
          // Run the query
          const result = await this.neo4jservice.write(query, {} )
        }
      }
    }
  }

  // Function to update LLM with new knowledge to improve the AI
  async updateResponse(question: string){
    question = this.question
    try{
      // Read the DB for the latest knowledge graph
      const query = ` MATCH (n1)-[r]->(n2) RETURN n1, r, n2`
      let {records, summary} = await this.neo4jservice.read(query, {})

      let data = []
      // Iterate through the records, check the best graph, push it to data
      for(let record of records){
        let node1 = (record.get('n1').properties.name).replace(/_/g, ' ').toLowerCase()
        let node2 = (record.get('n2').properties.name).replace(/_/g, ' ').toLowerCase()
        let edge = (record.get('r').type).replace(/_/g, ' ').toLowerCase()

        data.push(`${node1} ${edge} ${node2}`)
      }
      // Change the data array to string
      let text = data.toString().replace(/,/g, ', ')

      // Update the LLM with the new knowledge
      const res = await this.chat.getChatCompletions(process.env.OPENAI_DEPLOY_NAME, [
        {role: "system", content: "You are a response optimization algorithm designed for improving the knowledge graph. Your answer always straightforward and concise, without adding ANY conversational context."},
        {role: "system", content: "Your task is to generate better answers based on the given knowledge graph."},
        {role: "system", content: "Make sure to answer without any numeric lists or bullet points. NO LIST FORMAT ALLOWED. PARAGRAPH FORMAT ONLY. MAXIMUM 64 WORDS."},
        {role: "user", content: `This is the question: ${question}`},
        {role: "user", content: `This is the knowledge for you: ${text}`},
      ])

      const ans = res.choices[0].message.content
      this.answer = ans
      return ans
    } catch(error) {
      return error
    }
  }

  async resetProcess(){
    this.answer = ''
    this.question = ''

    // Delete the file.json
    const fs = require('fs');
    fs.unlinkSync('file.json')

    // Delete the graph
    const query = `MATCH (n) DETACH DELETE n`
    const result = await this.neo4jservice.write(query, {} )
  }

}
