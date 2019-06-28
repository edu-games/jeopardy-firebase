const functions = require('firebase-functions');
const admin = require('firebase-admin');
// admin.initializeApp(functions.config().firebase);
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: true }));

// Add middleware to authenticate requests
// app.use(myMiddleware);

app.post('/getGames', async (req, res) => {
    console.log('/getGames');
    try {
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
            res.status(200).json({ message: 'No documents' });
        } else {
            items = items.sort();
            res.send(items);
        }
    } catch (error) {
        res.status(500).json({ message: 'get games fail', data: error });
    }
});
app.get('/getGame/:id', async (req, res) => {
    console.log('/getGames');
    try {
        let { id } = req.params;

        const game = await db
            .collection('games')
            .doc(id)
            .get();

        res.status(200).json({
            message: 'get game success',
            data: game.data()
        });
    } catch (error) {
        res.status(500).json({ message: 'get game fail', data: error });
    }
});
app.post('/addGame', async (req, res) => {
    try {
        console.log('/addGame');
        const { name, uid } = req.body;
        const data = {
            gameName: name,
            author: uid
        };

        const gameRef = await db.collection('games').add(data);
        const game = await gameRef.get();
        res.json({ message: 'add game success', data: game });
    } catch (error) {
        res.status(500).json({ message: 'add game fail', data: error });
    }
});
app.delete('/deleteGame/:id', async (req, res) => {
    try {
        console.log(`/deleteGame/${req.params.id}`);
        const { id } = req.params;

        const questions = await db
            .collection('questions')
            .where('gameID', '==', id)
            .get();
        let questionIDs = [];
        questions.docs.forEach(doc => {
            questionIDs.push(doc.id);
        });
        if (questionIDs.length > 0) {
            questionIDs.forEach(id => {
                db.collection('questions')
                    .doc(id)
                    .delete();
            });
            await db
                .collection('games')
                .doc(id)
                .delete();
        } else {
            await db
                .collection('games')
                .doc(id)
                .delete();
        }

        res.status(204).json({ message: 'game delete success' });
    } catch (error) {
        res.status(500).json({ message: 'game delete fail', data: error });
    }
});
app.post('/addQuestion', async (req, res) => {
    try {
        console.log('/addQuestion');
        const { question, answer, gameID, uid, tags, points } = req.body;
        let tagArray;
        if (tags) {
            tagArray = tags.split(',');
        } else {
            tagArray = [];
        }

        await db.collection('questions').add({
            gameID: gameID,
            author: uid,
            question: question,
            answer: answer,
            points: points,
            tags: tagArray
        });
        res.status(200).json({ message: 'add question success' });
    } catch (error) {
        res.status(500).json({ message: 'add question fail', data: error });
    }
});

/**
 * Delete endpoint
 * Accepts the question ID in the body
 * {id: questionsID}
 */
app.delete('/deleteQuestion', async (req, res) => {
    try {
        console.log('/deleteQuestion');
        const { id } = req.body;

        await db
            .collection('questions')
            .doc(id)
            .delete();

        res.status(204).json({ message: 'question delete success' });
    } catch (error) {
        res.status(500).json({ message: 'question delete fail', data: error });
    }
});

app.post('/filterQuestions', async (req, res) => {
    const { uid, tags, points } = req.body;
    try {
        let result = [];
        const pointsItem = await db
            .collection('questions')
            .where('points', '==', points)
            .get();
        result.push(pointsItem.data());

        // for (let i = 0; i < tags.length; i++) {
        //     const tagItem = db
        //         .collection('questions')
        //         .where('points', '==', points);
        // }

        res.status(200).json({
            message: 'Filter questions successful',
            data: pointsItem
        });
    } catch (error) {
        res.status(500).json({ message: 'Filter questions failed' });
    }
});

exports.jeopardy = functions.https.onRequest(app);
