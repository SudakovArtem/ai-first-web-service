import { randomUUID } from 'node:crypto';
import Fastify from 'fastify';

type NewTicket = {
  title: string;
  description: string;
};

type Ticket = NewTicket & {
  id: string;
  createdAt: string;
};

const app = Fastify({
  ajv: { customOptions: { coerceTypes: false, removeAdditional: false } },
  bodyLimit: 32 * 1024,
});

const tickets: Ticket[] = [];

const newTicketSchema = {
  type: 'object',
  required: ['title', 'description'],
  additionalProperties: false,
  properties: {
    title: { type: 'string', maxLength: 160, pattern: '\\S' },
    description: { type: 'string', maxLength: 2000, pattern: '\\S' },
  },
};

app.removeContentTypeParser('text/plain');

app.get('/health', () => ({ status: 'ok' }));

app.get('/tickets', () => ({ tickets }));

app.post<{ Body: NewTicket }>(
  '/tickets',
  { schema: { body: newTicketSchema } },
  async ({ body }, reply) => {
    const ticket: Ticket = {
      id: randomUUID(),
      title: body.title.trim(),
      description: body.description.trim(),
      createdAt: new Date().toISOString(),
    };

    tickets.push(ticket);

    return reply.code(201).send(ticket);
  },
);

const address = await app.listen({
  host: '127.0.0.1',
  port: Number(process.env.PORT ?? 3000),
});

console.log(`Bug Triage API is listening at ${address}`);
