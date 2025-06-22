const functions = require('@google-cloud/functions-framework');
const { MongoClient } = require("mongodb");

// MongoDB-yhteys
// TODO: Sensitive Data, Replace password
const CONNECTION_STRING = "mongodb+srv://aiinaction:<password>@starteconcluster1.cg9gxnb.mongodb.net/?retryWrites=true&w=majority&appName=StarteconCluster1";
const client = new MongoClient(CONNECTION_STRING);
const dbName = "EcoWind";
const collName = "observations_wind_power_vectors";

// Get query item
const database = client.db(dbName);
const coll = database.collection(collName);

// Get query item from the collection
const query_item = coll.find_one({ "date": "002:00:00" });
const query_vector = query_item["vectors"];

// Get max values
const get_max_arr = (arr) => {
    const data = arr.reduce(function (final, current) {
        for (let i = 0; i < final.length; ++i) {
            if (current[i] > final[i]) {
                final[i] = current[i];
            }
        }
        return final;
    });

    return data;
}

// Get min values
const get_min_arr = (arr) => {
    const data = arr.reduce(function (final, current) {
        for (let i = 0; i < final.length; ++i) {
            if (current[i] < final[i]) {
                final[i] = current[i];
            }
        }
        return final;
    });

    return data;
}

// Sample data
const data_sample = {
    min: [
        { x: 1, y: 127.616173089822 },
        { x: 2, y: 116.718244466731 },
        { x: 3, y: 184.183439693084 },
        { x: 4, y: 24.7908009889562 },
        { x: 5, y: 21.4791890930953 },
        { x: 6, y: 142.640903020426 },
        { x: 7, y: 66.760607641305 },
        { x: 8, y: 147.549349762482 },
        { x: 9, y: 64.4045323042776 },
        { x: 10, y: 74.2616663612822 },
        { x: 11, y: 170.690021004066 },
        { x: 12, y: 61.290449378765 },
        { x: 13, y: -18.1976013736441 },
        { x: 14, y: 103.411905918383 },
        { x: 15, y: 97.7654362889193 },
        { x: 16, y: 62.6908642907958 },
        { x: 17, y: 0 },
        { x: 18, y: 72.6105264908738 },
        { x: 19, y: 189.432817999865 },
        { x: 20, y: 35.4140006791305 },
        { x: 21, y: 0 },
        { x: 22, y: 117.320297578004 },
        { x: 23, y: 134.753224480808 },
        { x: 24, y: 0 },
        { x: 25, y: 99.6025183661986 },
        { x: 26, y: 0 },
        { x: 27, y: 0 },
        { x: 28, y: 16.1414655360503 },
        { x: 29, y: 94.64837991378 },
        { x: 30, y: 32.7635091367773 },
        { x: 31, y: 0 },
        { x: 32, y: 25.271520950709 },
        { x: 33, y: 0 },
        { x: 34, y: 77.080923938652 },
        { x: 35, y: 112.698615420245 },
        { x: 36, y: 0 },
        { x: 37, y: 140.719966579598 },
        { x: 38, y: 0 },
        { x: 39, y: 0 },
        { x: 40, y: 15.6422216972486 },
        { x: 41, y: 0 },
        { x: 42, y: 17.9332904483148 },
        { x: 43, y: 0 },
        { x: 44, y: 86.485678375439 },
        { x: 45, y: 0 },
        { x: 46, y: 180.628739394998 },
        { x: 47, y: 15.6325083683526 },
        { x: 48, y: 116.672928000272 }
    ],
    ts: [
        { x: 1, y: 128.808096014884 },
        { x: 2, y: 121.033145779554 },
        { x: 3, y: 198.375441744823 },
        { x: 4, y: 26.7743697578478 },
        { x: 5, y: 35.0868804965273 },
        { x: 6, y: 174.477629504459 },
        { x: 7, y: 99.9745736021072 },
        { x: 8, y: 187.865914200315 },
        { x: 9, y: 112.857476087379 },
        { x: 10, y: 92.6142169786137 },
        { x: 11, y: 183.120492835648 },
        { x: 12, y: 116.586529810891 },
        { x: 13, y: 38.9652966738669 },
        { x: 14, y: 124.965028566988 },
        { x: 15, y: 152.628806451625 },
        { x: 16, y: 78.8007687523148 },
        { x: 17, y: 2.92018052119651 },
        { x: 18, y: 105.709565198331 },
        { x: 19, y: 193.56910744514 },
        { x: 20, y: 75.4209500518453 },
        { x: 21, y: 4.01097437813025 },
        { x: 22, y: 137.626175642739 },
        { x: 23, y: 176.130821510461 },
        { x: 24, y: 87.3839305277573 },
        { x: 25, y: 130.474926460441 },
        { x: 26, y: 5.06978901379902 },
        { x: 27, y: 116.062469105911 },
        { x: 28, y: 155.568970910941 },
        { x: 29, y: 132.484166960857 },
        { x: 30, y: 79.4269278496513 },
        { x: 31, y: 21.4826221376312 },
        { x: 32, y: 163.578948893418 },
        { x: 33, y: 72.0640373442532 },
        { x: 34, y: 192.756368303166 },
        { x: 35, y: 197.571471621239 },
        { x: 36, y: 106.62581277977 },
        { x: 37, y: 176.444201509798 },
        { x: 38, y: 89.7567451376276 },
        { x: 39, y: 11.776220259907 },
        { x: 40, y: 156.473140903259 },
        { x: 41, y: 13.9584166272589 },
        { x: 42, y: 53.4459149827267 },
        { x: 43, y: 52.9814434029572 },
        { x: 44, y: 108.602519834071 },
        { x: 45, y: 105.269329165421 },
        { x: 46, y: 186.726868717301 },
        { x: 47, y: 115.906822728622 },
        { x: 48, y: 125.135015459262 }
    ],
    max: [
        { x: 1, y: 129.067545790381 },
        { x: 2, y: 126.059927376753 },
        { x: 3, y: 244.550098053265 },
        { x: 4, y: 91.6431570073665 },
        { x: 5, y: 50.9684269804786 },
        { x: 6, y: 191.58023592771 },
        { x: 7, y: 182.867045762268 },
        { x: 8, y: 229.687002749342 },
        { x: 9, y: 169.673540250797 },
        { x: 10, y: 179.166733257139 },
        { x: 11, y: 205.347086907731 },
        { x: 12, y: 203.303225480495 },
        { x: 13, y: 210 },
        { x: 14, y: 382.780916630279 },
        { x: 15, y: 225.854645383811 },
        { x: 16, y: 223.640141461063 },
        { x: 17, y: 219.147678487036 },
        { x: 18, y: 171.015034237204 },
        { x: 19, y: 407 },
        { x: 20, y: 445.9514839526 },
        { x: 21, y: 385.385454491788 },
        { x: 22, y: 351.894324542998 },
        { x: 23, y: 246.024931526397 },
        { x: 24, y: 200 },
        { x: 25, y: 578.334617525879 },
        { x: 26, y: 300 },
        { x: 27, y: 493.186727183713 },
        { x: 28, y: 646.373810959561 },
        { x: 29, y: 213.473878848627 },
        { x: 30, y: 165.617987389414 },
        { x: 31, y: 143.727850156069 },
        { x: 32, y: 505 },
        { x: 33, y: 470.523782952949 },
        { x: 34, y: 407.365549523802 },
        { x: 35, y: 688.193224634332 },
        { x: 36, y: 647.676054281496 },
        { x: 37, y: 853.199904958889 },
        { x: 38, y: 455.269847976435 },
        { x: 39, y: 221.727417508255 },
        { x: 40, y: 386.920229754889 },
        { x: 41, y: 200 },
        { x: 42, y: 281.287805760689 },
        { x: 43, y: 442.976648673943 },
        { x: 44, y: 927.20119729763 },
        { x: 45, y: 477.312474659369 },
        { x: 46, y: 238.707045437369 },
        { x: 47, y: 435.302620306163 },
        { x: 48, y: 924.449374922734 }
    ]
};

functions.http('helloHttp', (req, res) => {
    // CORS
    res.set('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
    } else {
        await client.connect();

        // define search pipeline
        const pipeline = [
            {
                '$vectorSearch': {
                    'index': 'wind_power_vector_index',
                    'path': 'vectors',
                    'queryVector': query_vector,
                    'numCandidates': 100,
                    'limit': 10
                }
            }, {
                '$project': {
                    '_id': 0,
                    'id': 1,
                    'date': 1,
                    'windpower': 1,
                    'score': {
                        '$meta': 'vectorSearchScore'
                    }
                }
            }
        ];

        // run search pipeline
        const result = coll.aggregate(pipeline);

        //Format response
        const vectors = result.map(d => d["windpower"]);
        const conf_high = get_max_arr(vectors);
        const conf_low = get_min_arr(vectors);
        const best = vectors.length > 1 ? get_min_arr(vectors[1]) : [];

        const data_from_db = {
            min: (conf_low || []).map((d, i) => ({ x: i + 1, y: d })),
            ts: (best || []).map((d, i) => ({ x: i + 1, y: d })),
            max: (conf_high || []).map((d, i) => ({ x: i + 1, y: d }))
        }; 

        //TODO: Comment this to show sample data
        res.send(data_from_db);

        //TODO: Uncomment this to show sample data
        //res.send(data_sample);
    }
});
