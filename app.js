const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const spawnSync = require('spawn-sync');
const fs = require('fs');
const { spawn } = require('child_process');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.render('index', { castPath: null });
});

app.post('/ponysay', async (req, res) => {
  const message = req.body.message;
  const character = req.body.character;

  const castDir = path.join(__dirname, 'public', 'casts');
  fs.mkdirSync(castDir, { recursive: true });

  const tmpFile = path.join(castDir, `cast_${Date.now()}.cast`);

  const recordPonysay = async () => {
    return new Promise((resolve, reject) => {
      const recordProcess = spawn('asciinema', [
        'rec',
        '-c',
        `ponysay -f ${character} "${message}"`,
        tmpFile,
      ]);

      recordProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error('Asciinema recording process failed.'));
        } else {
          resolve();
        }
      });
    });
  };

  try {
    await recordPonysay();
    res.render('index', { castPath: `/casts${tmpFile.substring(castDir.length)}` });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error.');
  }
});

app.get('/cast/:file', (req, res) => {
  const file = req.params.file;
  res.sendFile(path.join(__dirname, 'tmp', file));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
