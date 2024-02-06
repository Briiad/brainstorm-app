import { DynamicModule, Module, Provider } from '@nestjs/common';
import { Neo4jService } from './neo4j.service';
import { NEO4J_CONFIG, NEO4J_DRIVER } from './neo4j.constants';
import { Neo4jConfig } from 'src/neo4j/neo4j-config.interface';
import { createDriver } from './neo4j.utils';
import { ConfigModule } from '@nestjs/config';

@Module({})

export class Neo4jModule {
  static forRoot(config: Neo4jConfig): DynamicModule {
    return {
      module: Neo4jModule,
      providers: [
        {
          provide: NEO4J_CONFIG,
          useValue: config
        },
        {
          provide: NEO4J_DRIVER,
          inject: [NEO4J_CONFIG],
          useFactory: async (config: Neo4jConfig) => createDriver(config),
        },
        Neo4jService
      ],
      exports: [Neo4jService]
    }
  }
  static forRootAsync(configProvider): DynamicModule {
    return{
      module: Neo4jModule,
      global: true,
      imports: [ConfigModule],
      providers: [
        {
          provide: NEO4J_CONFIG,
          ...configProvider
        } as Provider<any>,
        {
          provide: NEO4J_DRIVER,
          inject: [NEO4J_CONFIG],
          useFactory: async (config: Neo4jConfig) => createDriver(config),
        },
        Neo4jService
      ],
      exports: [Neo4jService]
    }
  }
}
