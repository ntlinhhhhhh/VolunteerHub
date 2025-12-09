import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('CommunicationService (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Posts API', () => {
    it('should list posts (public endpoint)', () => {
      return request(app.getHttpServer())
        .get('/posts')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should return 401 for protected endpoints without auth', () => {
      return request(app.getHttpServer())
        .post('/posts/event/test-event-id')
        .send({
          content: 'Test post',
          images: [],
          videos: []
        })
        .expect(401);
    });

    it('should return 400 for invalid post data', () => {
      return request(app.getHttpServer())
        .post('/posts/event/test-event-id')
        .send({
          // Missing required content field
          images: [],
          videos: []
        })
        .expect(400);
    });
  });

  describe('Service Status', () => {
    it('should respond to root endpoint', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(404); // No root route defined, should return 404
    });
  });
});