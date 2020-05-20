const express = require('express');
const cors = require('cors');

const { uuid, isUuid } = require('uuidv4');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function logRequests(request, response, next) {
  const { method, url } = request;
  const log = `[${method.toUpperCase()}] ${url}`;

  console.time(log);
  next();
  console.timeEnd(log);
}

function validateUuid(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response.status(400).json({
      error: 'Invalid repository ID.'
    });
  }

  return next();
}

function validateRepositoryExists(request, response, next) {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex((repo) => repo.id === id);
  if (repositoryIndex < 0) {
    return response.status(400).json({
      error: 'Repositório não encontrado!'
    });
  }

  request.body.repositoryIndex = repositoryIndex;

  return next();
}

app.use(logRequests);
app.use('/repositories/:id', validateUuid, validateRepositoryExists);

app.get('/repositories', (request, response) => {
  return response.json(repositories);
});

app.post('/repositories', (request, response) => {
  const repository = {
    id: uuid(),
    likes: 0,
    ...request.body
  };

  repositories.push(repository);

  return response.json(repository);
});

app.put('/repositories/:id', (request, response) => {
  const { id } = request.params;
  const { title, url, techs, repositoryIndex } = request.body;

  const repositoryToUpdate = { ...repositories[repositoryIndex] };
  repositoryToUpdate.title = title || repositoryToUpdate.title;
  repositoryToUpdate.url = url || repositoryToUpdate.url;
  repositoryToUpdate.techs = techs || repositoryToUpdate.techs;
  repositories[repositoryIndex] = repositoryToUpdate;

  return response.json(repositoryToUpdate);
});

app.delete('/repositories/:id', (request, response) => {
  const { id } = request.params;
  const { repositoryIndex } = request.body;

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

app.post('/repositories/:id/like', (request, response) => {
  const { id } = request.params;
  const { repositoryIndex } = request.body;
  const repositoryToUpdate = repositories[repositoryIndex];

  repositoryToUpdate.likes += 1;

  return response.status(200).send({
    likes: repositoryToUpdate.likes
  });
});

module.exports = app;
