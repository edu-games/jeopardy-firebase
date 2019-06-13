const admin = require('firebase-admin');
const functions = require('firebase-functions');
// admin.initializeApp(functions.config().firebase);
admin.initializeApp();
const db = admin.firestore();
const uuidv1 = require('uuid/v1');

const express = require('express');
const cors = require('cors');

const app = express();

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

// Add middleware to authenticate requests
// app.use(myMiddleware);

app.post('/getGames', async (req, res) => {
    try {
        // Grab the text parameter.
        let { uid } = req.body;
        let items = [];
        uid = uid.toString();

        const snapshot = await db
            .collection('games')
            .where('author', '==', uid)
            .get();

        snapshot.docs.forEach(doc => {
            items.push(doc.data());
        });

        if (snapshot.empty) {
            res.send('No documents');
        } else {
            items = items.sort();
            res.send(items);
        }
    } catch (err) {
        res.send('Unable to get games');
    }
});
app.post('/addGame', async (req, res) => {
    const { name, uid } = req.body;

    db.collection('games')
        .add({
            gameName: name,
            author: uid
        })
        .then(res.send('success'))
        .catch(error => {
            res.send('Unable to add game');
        });
});
app.delete('/deleteGame/:id', (req, res) => {
    const { id } = req.params;

    db.collection('games')
        .doc(id)
        .delete()
        .then(res.send('Document successfully deleted!'))
        .catch(error => {
            res.send('Unable to delete game');
        });
});
app.post('/addQuestion', async (req, res) => {
    const { question, answer, gameID, uid } = req.body;

    db.collection('questions')
        .add({
            question: question,
            answer: answer,
            gameID: gameID,
            author: uid
        })
        .then(res.send('success'))
        .catch(error => {
            res.send('Unable to add question', error);
        });
});

exports.jeopardy = functions.https.onRequest(app);
