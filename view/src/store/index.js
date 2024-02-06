
import Vuex, { createStore } from 'vuex'
import axios from 'axios';
import NeoVis from 'neovis.js/dist/neovis.js';

const graphRendering = () => {
  // Use neovis.js to render the graph
  const config = {
    containerId: 'viz',
    neo4j: {
      serverUrl: "bolt://localhost:7687",
      serverUser: "neo4j",
      serverPassword: import.meta.env.VITE_NEO4J_PASSWORD
    },
    labels: {
      "Source_Keywords":{
        label: "",
        size: 10,
        captions: true,
        [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
            function: {
              title: NeoVis.objectToTitleHtml,
            },
            static: {
              font: '18px',
              color: '#6419fa'
            }
        },
      },
      "Target_Keywords":{
          label: "",
          size: 10,
          captions: true,
          [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
              function: {
                title: NeoVis.objectToTitleHtml,
              },
              static: {
                font: '18px',
                color: '#dbd10d'
              }
          },
        },
    },
    initialCypher: "MATCH (n1)-[r]->(n2) RETURN n1, r, n2"
  }

  const viz = new NeoVis(config);
  viz.render();
}

const store = createStore({
  state:{
    response: "",

    // Not usable yet
    graphData: null
  },

  mutations:{
    setPrompt(state, payload){
      axios.post('http://localhost:3000/chat-api/answer', payload)
      .then(res => {
        state.response = res.data.content
      })
    },

    setGraph(state){
      axios.post('http://localhost:3000/chat-api/graph')
      .then(res => {
        state.graphData = res.data
        console.warn(state.graphData)
      })
      .then(() => {
        graphRendering()
      })
    },

    updateGraph(state){
      axios.post('http://localhost:3000/chat-api/update-response')
      .then(res => {
        state.response = res.data
        console.warn(state.graphData)
      })
      .then(() => {
        graphRendering()
      })
    },

    resetProcess(state){
      axios.post('http://localhost:3000/chat-api/reset')
      .then(res => {
        state.response = ''
        console.warn("Reset")
      })
      .then(() => {
        graphRendering()
      })
    }
  },
})

export default store