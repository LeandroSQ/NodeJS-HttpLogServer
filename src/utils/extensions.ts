Promise.prototype.sequentially = function (chain) {
    var results = [];
    var entries = chain;
    if (entries.entries) entries = entries.entries();
    return new Promise(function (yes, no) {
        var next = function () {
            var entry = entries.next();
            if(entry.done) yes(results);
            else {
                results.push(entry.value[1]().then(next, function() { no(results); } ));
            }
        };
        next();
    });
};