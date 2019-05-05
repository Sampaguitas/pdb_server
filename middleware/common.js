module.exports = {
  getNextSequence: function(name) {
    var ret = db.counters.findAndModify(
           {
             query: { _id: name },
             update: { $inc: { seq: 1 } },
             new: true
           }
    );
    return ret.seq;
 }
}