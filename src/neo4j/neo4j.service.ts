import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import neo4j from 'neo4j-driver';
import { Neo4jConfig } from 'src/neo4j/neo4j-config.interface';
import { NEO4J_CONFIG, NEO4J_DRIVER } from './neo4j.constants';
import { Driver } from 'neo4j-driver';

@Injectable()
export class Neo4jService implements OnApplicationShutdown {
  constructor(
    @Inject(NEO4J_CONFIG) private readonly config: Neo4jConfig,
    @Inject(NEO4J_DRIVER) private readonly driver: Driver
    ) {}

  getDriver(): Driver {
    return this.driver;
  }

  getConfig(): Neo4jConfig {
    return this.config;
  }

  getReadSession(database?: string) {
    return this.driver.session({
      defaultAccessMode: neo4j.session.READ,
      database: this.config.database || database
    });
  }

  getWriteSession(database?: string) {
    return this.driver.session({
      defaultAccessMode: neo4j.session.WRITE,
      database: this.config.database || database
    });
  }

  read(cypher: string, params: Record<string, any>, database?: string){
    const session = this.getReadSession(database);
    return session.run(cypher, params)
  }

  write(cypher: string, params: Record<string, any>, database?: string){
    const session = this.getWriteSession(database);
    return session.run(cypher, params)
  }

  onApplicationShutdown() {
    // Delete all nodes
    this.write('MATCH (n) DETACH DELETE n', {})
    this.driver.close();
  }
}
