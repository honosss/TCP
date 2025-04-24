function chunkArray(myArray, chunk_size){
    var results = [];

    while (myArray.length) {
        results.push(myArray.splice(0, chunk_size));
    }
    return results;
}

// let result = arr(data_aray, 5);

module.exports = chunkArray