const express = require('express');
const cors = require('cors');

const { uuid } = require('uuidv4');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

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
  const { title, url, techs } = request.body;

  const repositoryIndex = repositories.findIndex((repo) => repo.id === id);
  if (repositoryIndex < 0) {
    return response.status(400).json({
      error: 'Repositório não encontrado!'
    });
  }

  const repositoryToUpdate = { ...repositories[repositoryIndex] };
  repositoryToUpdate.title = title || repositoryToUpdate.title;
  repositoryToUpdate.url = url || repositoryToUpdate.url;
  repositoryToUpdate.techs = techs || repositoryToUpdate.techs;
  repositories[repositoryIndex] = repositoryToUpdate;

  return response.json(repositoryToUpdate);
});

app.delete('/repositories/:id', (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex((repo) => repo.id === id);
  if (repositoryIndex < 0) {
    return response.status(400).json({
      error: 'Repositório não encontrado!'
    });
  }

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

app.post('/repositories/:id/like', (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex((repo) => repo.id === id);
  if (repositoryIndex < 0) {
    return response.status(400).json({
      error: 'Repositório não encontrado!'
    });
  }

  repositories[repositoryIndex].likes += 1;

  return response.status(200).send({
    likes: repositories[repositoryIndex].likes
  });
});

module.exports = app;
