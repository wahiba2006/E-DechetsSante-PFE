const alerteRepository = require('../repositories/alerteRepository');

class AlerteController {
    async create(req, res) {
        try {
            const alerteId = await alerteRepository.create(req.body);
            res.status(201).json({ message: 'Alerte générée avec succès.', alerteId });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getActiveAlertes(req, res) {
        try {
            const alertes = await alerteRepository.findAllActive();
            res.json(alertes);
        } catch (error) {
            res.status(500).json({ error: 'Erreur lors de la récupération des alertes.' });
        }
    }

    async resolveAlerte(req, res) {
        try {
            await alerteRepository.resolve(req.params.id);
            res.json({ message: 'Alerte marquée comme résolue.' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new AlerteController();
