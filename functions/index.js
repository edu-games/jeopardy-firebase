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

app.get('/readMessages', async (req, res) => {
    try {
        // Grab the text parameter.
        const { uid } = req.body;
        let items = [];

        const snapshot = await db
            .collection('messages')
            .where('author', '==', uid)
            .get();

        snapshot.docs.forEach(doc => {
            items.push(doc.data());
        });

        if (snapshot.empty) {
            res.status(200).send('No documents');
        } else {
            res.status(200).send(items);
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

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
            res.status(200).send('No documents');
        } else {
            res.status(200).send(items);
        }
    } catch (err) {
        res.status(500).send(err);
    }
});
app.post('/addGame', async (req, res) => {
    const { name, uid } = req.body;

    db.collection('games')
        .add({
            gameName: name,
            author: uid
        })
        .then(res.status(200).send('success'))
        .catch(error => {
            res.send('You suck!');
            console.error('Error adding document: ', error);
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
        .then(res.status(200).send('success'))
        .catch(error => {
            res.send('You suck!');
            console.error('Error adding document: ', error);
        });
});
// exports.addMessage = functions.https.onRequest(async (req, res) => {
//     // Grab the text parameter.
//     const { message, uid } = req.body;
//     // Push the new message into the Realtime Database using the Firebase Admin SDK.
//     const snapshot = await db
//         .collection('messages')
//         .doc(uuidv1())
//         .set({ original: message, author: uid });
//     // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
//     res.set({ 'Access-Control-Allow-Origin': '*' })
//         .status(200)
//         .send('SUCCESS!');
// });

// });
exports.jeopardy = functions.https.onRequest(app);
