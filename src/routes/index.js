const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const statsFilePath = path.join(__dirname, "./stats.json");

const getStats = async (req, res, next) => {
    try {
        const data = fs.readFileSync(statsFilePath);
        const stats = JSON.parse(data);
        const playerStats = stats.find(player => player.id === Number(req.params.id));
        if (!playerStats) {
            const err = new Error('Player stats not found');
            err.status = 404;
            throw err;
        }
        res.json(playerStats);
    } catch (e) {
        next(e);
    }
};

const updateStats = async (req, res, next) => {
    try {
        const data = fs.readFileSync(statsFilePath);
        const stats = JSON.parse(data);
        const playerStats = stats.find(player => player.id === Number(req.params.id));
        if (!playerStats) {
            const err = new Error('Player stats not found');
            err.status = 404;
            throw err;
        }
        const newStatsData = {
            id: req.body.id,
            wins: req.body.wins,
            losses: req.body.losses,
            points_scored: req.body.points_scored,
        };
        const newStats = stats.map(player => {
            if (player.id === Number(req.params.id)) {
                return newStatsData;
            } else {
                return player;
            }
        });
        fs.writeFileSync(statsFilePath, JSON.stringify(newStats));
        res.status(200).json(newStatsData);
    } catch (e) {
        next(e);
    }
};

const deleteStats = async (req, res, next) => {
    try {
        const data = fs.readFileSync(statsFilePath);
        const stats = JSON.parse(data);
        const playerStats = stats.find(player => player.id === Number(req.params.id));
        if (!playerStats) {
            const err = new Error('Player stats not found');
            err.status = 404;
            throw err;
        }
        const newStats = stats.map(player => {
            if (player.id === Number(req.params.id)) {
                return null;
            } else {
                return player;
            }
        }).filter(player => player !== null);
        fs.writeFileSync(statsFilePath, JSON.stringify(newStats));
        res.status(200).end();
    } catch (e) {
        next(e);
    }
};

router
    .route('/api/v1/stats/:id')
    .get(getStats)
    .put(updateStats)
    .delete(deleteStats);

const createStats = async (req, res, next) => {
    try {
        const data = fs.readFileSync(statsFilePath);
        const stats = JSON.parse(data);
        const newStats = {
            id: req.body.id,
            wins: req.body.wins,
            losses: req.body.losses,
            points_scored: req.body.points_scored,

        };
        const index = stats?.findIndex(item => item.id === newStats.id);
        if (index === -1) {
            stats.push(newStats);
            fs.writeFileSync(statsFilePath, JSON.stringify(stats));
            res.status(201).json(newStats);
        } else {
            const err = new Error('Player id is already exists');
            err.status = 404;
            throw err;
        }

    } catch (e) {
        next(e);
    }
};

router
    .route('/api/v1/stats')
    .post(createStats);

module.exports = router;