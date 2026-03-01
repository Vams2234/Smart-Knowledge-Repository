const Setting = require('../models/Setting');

exports.getSettings = async (req, res) => {
    try {
        const settings = await Setting.findAll();
        const formatted = {};
        settings.forEach(s => {
            formatted[s.key] = s.value;
        });
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateSetting = async (req, res) => {
    try {
        const { key, value } = req.body;
        const [setting] = await Setting.upsert({ key, value: String(value) });
        res.json(setting);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};