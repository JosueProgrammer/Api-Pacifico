import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseConfig {
  private static instance: FirebaseConfig;
  private app: admin.app.App;

  private constructor() {
    // Configuración de Firebase usando las credenciales proporcionadas
    const serviceAccount = {
      type: "service_account",
      project_id: "ecolunar-ea010",
      private_key_id: "a4a564d8fc0c65dcfbb51a99af095a4c12a5ec53",
      private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDW71lhaZGp78QU\nbRBqzORgzK1SD9ohax37lEaSqb+TdopMDL0hhe9UgZogLewQ885/0unzYdb/DX6e\nGmtNEI3UZPaer6yKxLLeZKio3wRe5QvlalqPikCSWVtcZJXRygJ+XnFSnPwO8Uyd\nkK88BOzKIzoqYCOgjqOvUD2bDZmvJR91ijUCOQUbIQMerle99tckL9BfreTqSJnw\nfdI6gpUc89oQ2G5YOMRG1n/vJ6dFVyuoIbs4NM74ZxmL4J+m3XqGkfK/l8ms1ij4\nvBztFoHR5VkCYDkBTRsFUuO9GjfEiOb3+R8AeNN4JxvCCS7kQdBolkDWyBrAL6Qf\nL0+uKpR3AgMBAAECggEAOFJ5LAcjdhIP4kBgNHRjhiAsbNwdj3NH5JSK18TmoEhI\nXjxaVU4JFK5vim4uNZUF8EX/K1lgou5Q1zJaGtQzLkyUuamUP7rimldrQPFL7mf7\n8Y6ok4OpfxAuWiw7fEGA3Md3z6u2e13s8z8mREaQHDoV9GPEAj9OklKnChoKwzOu\nPry+ckXdSfyewLnZXkh0x7GPTQPDD7DeEzEFYRd9b+7LLpxEWm1auPUraM0AUa4a\nqCntUqT+peIN9AVeRXHfZbeKpTuhKM2VvZakysZ2pW2WfwiXzNP6J3VOPo+0tuPS\nDXHNexubxo1Q39W7E9pp68k+E2o5PDECc3NpmKJ16QKBgQDW/X0z1qJaFEwbBa7d\nEJyQh6Q5IXuynFEQUNHA+RKMy0edG1yjt4seVX4WGThX2QIjE+t9T8CDwEWELUaF\nsOvIeuhPtGXn8jJcWI1jD7IH/xkJtew0a8bWse91/DqmJwe7Q5pJAAuaLY51cGmm\nmetaJONQQgRMbtofJZpzBZEHvwKBgQD/7ymwk7buw9ADf5ljrJZqeYoQHNs46K88\nd0BQOEO26EWJarAqrQ4jEJlN4O4IsDBEwr3qTYRSVOIXQ+oIvwxQUOPk70VBLXZg\nxArTNwAO4mycJfSRdf4hwCnAcVq1duNmMchW0bNHjgDCU4WvfHvlYiS5fbjcuAXI\nDFQk1CBhSQKBgQCcGzYlRO1gISrd2DOPm3dDzuok/bYXDEAka7rSt0iL6TMX1f1f\nd2/R19wU6b0qtI1DsTwmIpm0URFpF4MEomGikfRLo773O7rrqPUJACWSft3MWkeo\nDLY1wMAS2NIxQVfw1vaZmSnTis7NYZGlglANhYl1BmqeoUNKqIBMkrcrewKBgQCR\n7dRfklokGhJpbEARzT6Wx2Ypecql0Ebau0Q4eVxi1l2P1P1N2A7Pf49qEG6pFYzw\nJ/oRttFUAIJJsben9QcYZIcM6kEawMlWs3FYrWujEQfMoPeqWRTmOaOUzw1hmsBe\nbNRGbJtEmXtlUipPvTMHv8Yg3caiU2s4fY8c0LcFwQKBgDJfO8FzEJX//FYBNOcD\noNvdcL1FiZX6IlYFI3+TvQ3SGwQwygvgFotfh+0EjXDtK+96mwfeNsgsxKnA7FA+\nx//mnISssaMBrggf9O47Q8OGOSmOy782mHWt8UHDdAuQPdp+6B3YrcFlUfwUgdkP\nQZu8LoWvSHNtp2gRnYvaKgvj\n-----END PRIVATE KEY-----\n",
      client_email: "firebase-adminsdk-8ehnv@ecolunar-ea010.iam.gserviceaccount.com",
      client_id: "112996279707499584827",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-8ehnv%40ecolunar-ea010.iam.gserviceaccount.com",
      universe_domain: "googleapis.com"
    };

    this.app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      storageBucket: 'ecolunar-ea010.appspot.com'
    });
  }

  public static getInstance(): FirebaseConfig {
    if (!FirebaseConfig.instance) {
      FirebaseConfig.instance = new FirebaseConfig();
    }
    return FirebaseConfig.instance;
  }

  public getApp(): admin.app.App {
    if (!this.app) {
      throw new Error('Firebase app no está inicializada');
    }
    return this.app;
  }

  public getStorage(): admin.storage.Storage {
    if (!this.app) {
      throw new Error('Firebase app no está inicializada. Llama a getInstance() primero.');
    }
    return this.app.storage();
  }
}

