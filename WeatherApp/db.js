var weatherDB = (function(logger) {
    //constants and variables
    const temperatureStore = 'temperature';
    const precipitationStore = 'precipitation';
    const dataBaseName = 'weather-database';
    const indexName = 'year-month';

    let self = this;
    self.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;

    self.connect = function(dbName) {
        return new Promise((resolve, reject) => {
            let request = self.indexedDB.open(dbName, 1);
            request.onerror = (err) => {
                logger.error('Connection to DB "'+dbName+'" failed due to error: ' + err);
                reject(err);
            };
            request.onsuccess = () => {
                logger.info('Connected to DB "' + dbName + '".');
                resolve(request.result);                
            }
            request.onupgradeneeded = (e) => {
                logger.info('DB out of date or not exists, upgrading...');

                e.currentTarget.result.createObjectStore(temperatureStore, { keyPath: 'id', autoIncrement: true })
                    .createIndex(indexName, ["year", "month"], {unique: true});

                e.currentTarget.result.createObjectStore(precipitationStore, { keyPath: 'id', autoIncrement: true })
                    .createIndex(indexName, ["year", "month"], {unique: true});
               
                e.target.transaction.oncomplete = (e) => resolve;
            }
        });
    };

    self.disconnect = function() {
        self.indexedDB.close();
        logger.info('disconnected from DB "' + dbName + '".');
    };

    self.readDataFromStore = function(storeName, yearFrom, yearTo) {
        return new Promise((resolve, reject) => {
            self.connect(dataBaseName)
                .then((db) => {
                    let idx = db.transaction([storeName], "readonly").objectStore(storeName).index(indexName);
                    let boundKeyRange = IDBKeyRange.bound([yearFrom, 0], [yearTo, 13], false, false);
                    let data = [];
                    let expectedCount = ((yearTo - yearFrom) + 1) * 12;
                    idx.openCursor(boundKeyRange).onsuccess = (e) => {
                      let cursor = e.target.result;
                      if (cursor) {
                        data.push(cursor.value);
                        cursor.continue();
                      } else {
                        if (expectedCount !== data.length) {
                            reject('Data not found for expected range');
                        } else {
                            logger.info(expectedCount + ' records loaded from store "' + storeName + '".');
                            resolve(data);
                        }
                      }
                    };
                });
        });
    };
    self.writeDataToStore = function(storeName, data) {
        return new Promise((resolve, reject) => {
            self.connect(dataBaseName)
                .then((db) => {
                    let counter = 0;
                    let store = db.transaction([storeName], "readwrite").objectStore(storeName);
                    let index = store.index(indexName);
                    let putNext = () => {
                        let record = data[counter];
                        if (counter == data.length) {
                            logger.info('Store "' + storeName + '" populated with ' + counter + ' records.');
                            resolve(data);
                        } else {
                            let request = index.openCursor(IDBKeyRange.only([record.year, record.month]));
                            request.onerror = reject;
                            request.onsuccess = (e) => {
                                let cursor = e.target.result;
                                if (cursor)  {
                                    let current = cursor.value;
                                    current.daysValues = record.daysValues;
                                    cursor.update(current).onsuccess = putNext;
                                } else {
                                    store.put(record).onsuccess = putNext;
                                }
                            }
                            counter++;
                        }
                    };
                    putNext();
                });
        });
    };

    self.getPrecipitation = function(yearFrom, yearTo) {
        return readDataFromStore(precipitationStore, yearFrom, yearTo);
    };

    self.setPrecipitation = function(data) {
        return writeDataToStore(precipitationStore, data);
    };

    self.getTemperature = function(yearFrom, yearTo) {
         return readDataFromStore(temperatureStore, yearFrom, yearTo);
    };

    self.setTemperature = function(data) {
        return writeDataToStore(temperatureStore, data);
    };


    return {
        getPrecipitationData: getPrecipitation,
        setPrecipitationData: setPrecipitation,
        getTemperatureData: getTemperature,
        setTemperatureData: setTemperature,
    }

})(weatherLogger);