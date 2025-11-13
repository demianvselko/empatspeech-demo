db = db.getSiblingDB('speech_therapy');
db.createUser({
  user: 'app',
  pwd: 'app123',
  roles: [{ role: 'readWrite', db: 'speech_therapy' }],
});
