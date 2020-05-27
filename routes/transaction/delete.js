const express = require('express');
const router = express.Router();
const Transaction = require('../../models/Transaction');

router.delete('/', (req, res) => {
    
    let transactionId = decodeURI(req.query.id);

    if (!transactionId) {
        return res.status(400).json({message: 'You need to pass an Id.'});
    } else {
        Transaction.findByIdAndDelete(transactionId, function (err, transaction) {
            if (err) {
                return res.status(400).json({message: 'An error has occured.'}); 
            } else if (!transaction) {
                return res.status(400).json({message: 'Could not find Transaction.'}); 
            } else {
                return res.status(200).json({message: 'Transaction has successfully been deleted.'}); 
            }
        });
    }
    
});

module.exports = router;