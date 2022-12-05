const express = require('express');
const app = express();

const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors')
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion } = require("mongodb");
const mongoose = require('mongoose');
const { default: axios } = require('axios');
const crypto = require("crypto");
var fetch = require('node-fetch-polyfill');

const whitelist = ["https://fiewin-43137.web.app"];
let corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || !origin) {
            console.log("✅ CORS: origin allowed");
            callback(null, true);
        } else {
            callback(new Error(`${origin} not allowed by CORS`));
        }
    },
};

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors(corsOptions));

const uri = "mongodb+srv://biomeeadmin:jcxfYgWQKLOzxzhn@cluster0.xgynqbe.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(uri).then(console.log('connected'))

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

const server = http.createServer(app)
let roomId = 1036378203

const io = new Server(server, {
    cors: {
        origin: "https://fiewin-43137.web.app",
        methods: ["GET", "POST"]
    }
});

server.listen(8080, () => {
    console.log('Server is running')
});

const checkInSchema = new mongoose.Schema({
    id: String,
    day: Number,
    date: Number
})

const refSchema = new mongoose.Schema({
    id: String,
    user: String,
    level: Number,
    date: String,
    totalDeposit: Number,
    bonus: Number
})

const totalRefSchema = new mongoose.Schema({
    id: String,
    lv1: Number,
    lv2: Number,
    lv3: Number
})

const userSchema = new mongoose.Schema({
    phoneNumber: Number,
    password: String,
    name: String,
    id: String,
    userToken: String,
    accessToken: String,
    lv1: String,
    lv2: String,
    lv3: String
});

const fastParityOrderSchema = new mongoose.Schema({
    id: String,
    period: String,
    amount: Number,
    selectType: String,
    select: String,
    result: Number,
})

const balanceSchema = new mongoose.Schema({
    id: String,
    mainBalance: Number,
    depositBalance: Number,
    refBalance: Number
})

const depositSchema = new mongoose.Schema({
    id: String,
    orderId: Number,
    amount: Number,
    date: String
})

const addCardSchema = new mongoose.Schema({
    id: String,
    isBank: Boolean,
    name: String,
    account: String,
    ifsc: String,
    upi: String,
    isActive: Boolean,
    iId: String
});

const withdrawalSchema = new mongoose.Schema({
    id: String,
    isBank: Boolean,
    name: String,
    account: String,
    ifsc: String,
    upi: String,
    amount: Number,
    status: String,
    wid: Number,
    fee: Number,
    date: String
})

const taskSchema = new mongoose.Schema({
    id: String
}, {
    strict: false
})

const fastParitySchema = new mongoose.Schema({
    id: String,
    winner: String
})

const userModel = mongoose.model('user', userSchema)
const balanceModel = mongoose.model('balance', balanceSchema);
const addCardModel = mongoose.model('account', addCardSchema);
const fastParityModel = mongoose.model('fastParity', fastParitySchema)
const fastParityOrderModel = mongoose.model('fastParityOrder', fastParityOrderSchema)
const checkInModel = mongoose.model('checkin', checkInSchema)
const refModel = mongoose.model('referral', refSchema)
const totalRefModel = mongoose.model('totalReferral', totalRefSchema)
const depositModel = mongoose.model('deposit', depositSchema)
const taskModel = mongoose.model('task', taskSchema)
const withdrawalModel = mongoose.model('withdrawal', withdrawalSchema)

app.get('/', async (req, res) => {
    try {
        res.json({ status: 'live' })
    } catch (error) {
        res.json({ error: error })
    }
});

app.post('/send-otp', async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        let otp = await fetch(`https://tganand.xyz/Ex/?mo=${phoneNumber}&type=1`)
            .then(function (res) {
                return res.text();
            }).then(function (body) {
                return body
            });

        let data = JSON.parse(otp)

        if (data.code === 400) return res.status(400).send({ success: false, error: 'Failed to send Otp' })

        return res.status(200).send({ success: true })
    } catch (error) {
        console.log('Error: \n', error)
        return res.status(400).send({ success: false, error: 'Failed to send otp.' })
    }
});

app.post('/register', async (req, res) => {
    try {
        const { phoneNumber, otp, password, inviter } = req.body;
        console.log(req.body);

        let result = await client.connect()
        let db = result.db('test')
        let collection2 = db.collection('users');
        let collection3 = db.collection('balances');
        let collection4 = db.collection('totalreferrals')

        let resp = await fetch(`https://tganand.xyz/Ex/?mo=${phoneNumber}&type=2&otp=${otp}`)
            .then(function (res) {
                return res.text();
            }).then(function (body) {
                return JSON.parse(body);
            });

        console.log(resp)

        let resp2 = await collection2.findOne({ phoneNumber: parseFloat(phoneNumber) });

        let lv1, lv2, lv3;
        if (inviter) {
            let resp3 = await collection2.findOne({ id: inviter })

            if (resp3) {
                lv1 = resp3.id;

                if (resp3.lv1) {
                    lv2 = resp3.lv1
                }

                if (resp3.lv2) {
                    lv3 = resp3.lv2
                }
            }
        }

        if (resp.code === 400) return res.status(400).send({ success: false, error: 'Otp is Invalid or Expired.' })
        if (resp2) return res.status(400).send({ success: false, error: 'User exists already.' });

        function randomString(length, chars) {
            var result = '';
            for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
            return result;
        }

        const uid = randomString(8, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ')
        const token = crypto.randomBytes(64).toString('hex')

        let d = new Date()
        let y = ("0" + d.getFullYear()).slice(-2)
        let m = ("0" + d.getMonth()).slice(-2)
        let d2 = ("0" + d.getDate()).slice(-2)

        let h = ("0" + d.getHours()).slice(-2)
        let m2 = ("0" + d.getMinutes()).slice(-2)

        const user = new userModel({
            phoneNumber,
            password,
            name: "",
            userToken: token,
            id: uid,
            lv1: lv1 ? lv1 : null,
            lv2: lv2 ? lv2 : null,
            lv3: lv3 ? lv3 : null
        })

        const balance = balanceModel({
            id: uid,
            mainBalance: 0,
            depositBalance: 10,
            refBalance: 0
        })

        const checkInData = new checkInModel({
            id: uid,
            day: 0,
            date: parseFloat(`${y}${m}${d2}`)
        })

        const totalRef = totalRefModel({
            id: uid,
            lv1: 0,
            lv2: 0,
            lv3: 0
        })

        let lv1Data, lv2Data, lv3Data;
        if (lv1) {
            lv1Data = new refModel({
                id: lv1,
                user: uid,
                level: 1,
                date: `${d2}/${m}/${y} ${h}:${m2}`,
                totalDeposit: 0,
                bonus: 1
            })
        }

        if (lv2) {
            lv2Data = new refModel({
                id: lv2,
                user: uid,
                level: 2,
                date: `${d2}/${m}/${y} ${h}:${m2}`,
                totalDeposit: 0,
                bonus: 0
            })
        }

        if (lv3) {
            lv3Data = new refModel({
                id: lv3,
                user: uid,
                level: 3,
                date: `${d2}/${m}/${y} ${h}:${m2}`,
                totalDeposit: 0,
                bonus: 0
            })
        }

        user.save()
        balance.save()
        totalRef.save()
        checkInData.save()

        if (lv1) {
            collection3.findOneAndUpdate({ id: lv1 }, { $inc: { refBalance: 1 } })
            collection4.findOneAndUpdate({ id: lv1 }, { $inc: { lv1: 1 } })
            lv1Data.save()
        }

        if (lv2) {
            collection4.findOneAndUpdate({ id: lv2 }, { $inc: { lv2: 1 } })
            lv2Data.save()
        }

        if (lv3) {
            collection4.findOneAndUpdate({ id: lv3 }, { $inc: { lv3: 1 } })
            lv3Data.save()
        }

        return res.status(200).send({ success: true, user: token })
    } catch (error) {
        console.log('Error: \n', error);
        return res.status(400).send({ success: false, error: 'Something went wrong' })
    }
});

app.post('/login', async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;
        console.log(req.body)

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');

        let resp = await collection.findOne({ phoneNumber: parseFloat(phoneNumber), password });

        if (!resp) return res.status(400).send({ success: false, error: 'User not exists.' })

        res.status(200).send({
            success: true,
            user: resp.userToken
        })
    } catch (error) {
        console.log('Error: \n', error);
        return res.status(400).send({ success: false, error: 'Something went wrong!' })
    }
});

app.post('/balance', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body);

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');
        let collection2 = db.collection('balances');

        collection.findOne({ userToken: id }).then(response => {
            collection2.findOne({ id: response.id }).then(response2 => {
                return res.status(200).send({ success: true, withdraw: response2.mainBalance.toFixed(2), deposit: response2.depositBalance.toFixed(2), referral: response2.refBalance.toFixed(2) })
            }).catch(error => {
                console.log('Error: \n', error)
                return res.status(400).send({ success: false, error: 'Unable to fetch account.' })
            })
        }).catch(error => {
            console.log('Error: \n', error)
            return res.status(400).send({ success: false, error: 'Unable to fetch account.' })
        })
    } catch (error) {

    }
});

app.post('/id', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body);

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');

        let resp = await collection.findOne({ userToken: id })

        return res.status(200).send({ success: true, id: resp.id, name: resp.name, phone: resp.phoneNumber })
    } catch (error) {

    }
});

app.post('/withdrawalRecords', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body);

        const user = await userModel.findOne({ userToken: id});
        const records = await withdrawalModel.find({ id: user.id })

        if(records.length === 0) return res.status(200).send({ success: true, records: false})

        return res.status(200).send({ success: true, records: true, data: records})
    } catch (error) {
        console.log('Error: ', error);
        return res.status(400).send({ success: false, error: 'Something went wrong'})
    }
})

app.post('/withdraw', async (req, res) => {
    try {
        const { id, amount} = req.body;
        console.log(req.body)

        const user = await userModel.findOne({ userToken: id});
        const balance = await balanceModel.findOne({ id: user.id});
        const card = await addCardModel.findOne({ id: user.id, isActive: true});

        if(balance.mainBalance < parseFloat(amount)) return res.status(400).send({ success: false, error: 'Insufficient Balance'})
        if(!card) return res.status(400).send({ success: false, error: 'No active payment method'})

        let date = new Date();
        let rNumber = Math.floor(Math.random() * 10000)
        let eDate = date.getFullYear() + '' + ("0" + date.getMonth()).slice(-2) + '' + ("0" + date.getDate()).slice(-2) + '' + ("0" + date.getHours()).slice(-2) + '' + ("0" + date.getMinutes()).slice(-2) + '' + ("0" + date.getSeconds()).slice(-2) + '' + ("0" + date.getMilliseconds()).slice(-2) + '' + rNumber

        if(card.isBank === true) {
            let data = new withdrawalModel({
                id: user.id,
                amount: parseFloat(amount) - (parseFloat(amount) * 2 / 100),
                status: 'Pending',
                isBank: true,
                name: card.name,
                account: card.account,
                ifsc: card.ifsc,
                wid: parseFloat(eDate),
                fee: parseFloat(amount) * 0.02,
                date: ("0" + date.getMonth()).slice(-2) + '/' + ("0" + date.getDate()).slice(-2) + ' ' + ("0" + date.getHours()).slice(-2) + ':' + ("0" + date.getMinutes()).slice(-2)
            })

            data.save()
        } else {
            let data = new withdrawalModel({
                id: user.id,
                amount: parseFloat(amount) - (parseFloat(amount) * 2 / 100),
                status: 'Pending',
                isBank: false,
                name: card.name,
                upi: card.upi,
                wid: parseFloat(eDate),
                fee: parseFloat(amount) * 0.02,
                date: ("0" + date.getMonth()).slice(-2) + '/' + ("0" + date.getDate()).slice(-2) + ' ' + ("0" + date.getHours()).slice(-2) + ':' + ("0" + date.getMinutes()).slice(-2)
            })

            data.save()
        }

        await balanceModel.updateOne({ id: user.id}, {
            $inc: {
                mainBalance: -parseFloat(amount)
            }
        })

        return res.status(200).send({ success: true})
    } catch (error) {
        console.log('Error: ', error);
        return res.status(400).send({ success: false, error: 'Something went wrong'})
    }
})

app.post('/account', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body);

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');
        let collection2 = db.collection('accounts');

        collection.findOne({ userToken: id }).then(response => {
            collection2.findOne({ id: response.id, isActive: true }).then(response2 => {
                if (response2) {
                    if (response2.isBank) {
                        return res.status(200).send({ success: true, active: true, isBank: true, name: response2.name, account: response2.account, ifsc: response2.ifsc })
                    } else {
                        return res.status(200).send({ success: true, active: true, isBank: false, name: response2.name, upi: response2.upi })
                    }
                } else {
                    return res.status(200).send({ success: true, active: false })
                }
            }).catch(error => {
                console.log('Error: \n', error)
                return res.status(400).send({ success: false, error: 'Unable to fetch account.' })
            })
        }).catch(error => {
            console.log('Error: \n', error)
            return res.status(400).send({ success: false, error: 'Unable to fetch account.' })
        })
    } catch (error) {
        console.log('Error: \n', error)
            return res.status(400).send({ success: false, error: 'Something went wrong' })
    }
});

app.post('/allAccount', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body);

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');
        let collection2 = db.collection('accounts');

        let response = await collection.findOne({ userToken: id })
        let response2 = await collection2.find({ id: response.id }).toArray()

        if (response2) {
            return res.status(200).send({ success: true, active: true, data: response2 })
        } else {
            return res.status(200).send({ success: true, active: false })
        }
    } catch (error) {

    }
});

app.post('/claimTask', async (req, res) => {
    try {
        const { id, task } = req.body;
        console.log(req.body);

        let bonus = {
            TASK0001: 5,
            TASK0002: 5,
            TASK0003: 20,
            TASK0004: 100,
            TASK0005: 1000
        }

        if (!bonus[task]) return res.status(400).send({ success: false, error: 'Failed to verify task.' })

        const user = await userModel.findOne({ userToken: id })
        const t = await taskModel.findOne({ id: user.id })

        if (t && t[task]) return res.status(400).send({ success: false, error: 'Failed to verify task.' })

        if (!t) {
            let data = new taskModel({
                id: user.id,
                [task]: true
            })

            data.save()
        } else {
            await taskModel.updateOne({ id: user.id }, {
                $set: {
                    [task]: true
                }
            })
        }

        await balanceModel.updateOne({ id: user.id }, {
            $inc: {
                mainBalance: bonus[task]
            }
        })

        return res.status(200).send({ success: true })
    } catch (error) {
        console.log('Error: ', error)
    }
})

app.post('/getTask', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body);

        const user = await userModel.findOne({ userToken: id })
        const deposit = await depositModel.find({ id: user.id })
        const invite = await totalRefModel.findOne({ id: user.id })
        const order = await fastParityOrderModel.find({ id: user.id })
        const task = await taskModel.findOne({ id: user.id })

        return res.status(200).send({ success: true, deposit: deposit.length > 0 ? true : false, invite: invite.lv1 > 0 ? true : false, order: order.length, task: task })
    } catch (error) {
        console.log('Error: ', error)
    }
});

app.post('/team', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body);

        const user = await userModel.findOne({ userToken: id})
        const totalRef = await totalRefModel.findOne({ id: user.id})
        const lv1 = await refModel.find({ id: user.id, level: 1})
        const lv2 = await refModel.find({ id: user.id, level: 2})
        const lv3 = await refModel.find({ id: user.id, level: 3})

        return res.status(200).send({ success: true, t1: totalRef.lv1, t2: totalRef.lv2, t3: totalRef.lv3, d1: lv1, d2: lv2, d3: lv3})
    } catch (error) {
        console.log('Error: ', error);
        return res.status(400).send({ success: false, error: 'Something went wrong'})
    }
})

app.post('/checkIn', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body);

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');
        let collection2 = db.collection('checkins');
        let collection3 = db.collection('balances');

        const newDate = new Date();
        const dateF = ("0" + newDate.getFullYear()).slice(-2) + '' + ("0" + newDate.getMonth()).slice(-2) + '' + ("0" + newDate.getDate()).slice(-2)
        const aDate = parseFloat(dateF)

        const nDate = new Date(Date.now() + (3600 * 1000 * 24))
        const dateN = ("0" + nDate.getFullYear()).slice(-2) + '' + ("0" + nDate.getMonth()).slice(-2) + '' + ("0" + nDate.getDate()).slice(-2)

        let response = await collection.findOne({ userToken: id });
        let response3 = await collection2.findOne({ id: response.id });
        let day = response3.day;
        let date = response3.date;

        if (aDate === date || aDate > date) {
            await collection3.updateOne({ id: response.id }, {
                $inc: {
                    depositBalance: day === 0 ? 1 : day === 1 || day === 2 || day === 3 ? 2 : 3
                }
            })

            await collection2.updateOne({ id: response.id }, {
                $set: {
                    day: day === 7 ? 0 : day + 1,
                    date: parseFloat(dateN)
                }
            })

            return res.status(200).send({ success: true, day: day === 7 ? 0 : day + 1, date: parseFloat(dateN) })
        }

        return res.status(400).send({ success: false, message: 'Something went wrong' })
    } catch (error) {
        console.log('Error: ', error)
        return res.status(400).send({ success: false, message: 'Something went wrong' })
    }
})

app.post('/claim', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body)

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');
        let collection2 = db.collection('checkins');

        let response = await collection.findOne({ userToken: id })
        let response2 = await collection2.findOne({ id: response.id })

        return res.status(200).send({ success: true, day: response2.day, date: response2.date })
    } catch (error) {

    }
})

app.post('/addCard', async (req, res) => {
    try {
        const { id, bank, name, accountNumber, upi, ifsc } = req.body;
        console.log(req.body);

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');
        let collection2 = db.collection('accounts');

        let resp = await collection.findOne({ userToken: id })
        if (!resp) return res.status(400).send({ success: false })

        let resp2 = await collection2.findOne({ id: resp.id, isActive: true })

        function randomString(length, chars) {
            var result = '';
            for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
            return result;
        }

        const iId = randomString(16, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ')

        if (bank) {
            const data = new addCardModel({
                id: resp.id,
                isBank: true,
                name,
                account: accountNumber,
                ifsc,
                isActive: true,
                iId
            })

            data.save()
            if (resp2) {
                collection2.findOneAndUpdate({ iId: resp2.iId, id: resp.id }, {
                    $set: {
                        isActive: false
                    }
                })
            }
        } else {
            const nData = new addCardModel({
                id: resp.id,
                isBank: false,
                name,
                upi,
                isActive: true,
                iId
            })

            nData.save()
            if (resp2) {
                collection2.findOneAndUpdate({ iId: resp2.iId, id: resp.id }, {
                    $set: {
                        isActive: false
                    }
                })
            }
        }

        return res.status(200).send({ success: true })
    } catch (error) {

    }
})

app.post('/deposit', async (req, res) => {
    try {
        const { id, tid } = req.body;
        console.log(req.body);

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');
        let collection2 = db.collection('deposits');
        let collection3 = db.collection('balances')

        let resp = await collection.findOne({ userToken: id })
        let resp2 = await collection2.findOne({ orderId: parseFloat(tid) })

        fetch(`https://txt.i-payments.site/paytmQR/?key=zHPUrT54551426639646&id=${tid}`)
            .then(function (res) {
                return res.text();
            }).then(function (body) {
                let data = JSON.parse(body)

                if (data.STATUS === 'TXN_FAILURE') {
                    return res.status(400).send({ success: false, error: 'Invalid or order id has been used already.' })
                } else {
                    if (resp2) return res.status(400).send({ success: false, error: 'Invalid or order id has been used already.' })

                    let deposit = new depositModel({
                        id: resp.id,
                        orderId: parseFloat(data.ORDERID),
                        amount: parseFloat(data.TXNAMOUNT),
                        date: data.TXNDATE
                    })

                    collection3.findOneAndUpdate({ id: resp.id }, { $inc: { depositBalance: parseFloat(data.TXNAMOUNT) } })

                    deposit.save()
                    return res.status(200).send({ success: true })
                }
            }).catch(function (error) {
                return res.status(400).send({ success: false, error: 'Failed to fetch order id.' })
            })
    } catch (error) {
        return res.status(400).send({ success: false, error: 'Something went wrong.' })
    }
});

app.post('/rechargeRecords', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body);

        const user = await userModel.findOne({ userToken: id })
        const records = await depositModel.find({ id: user.id })

        if (records.length === 0) return res.status(200).send({ success: true, isData: false })

        return res.status(200).send({ success: true, isData: true, data: records })
    } catch (error) {
        console.log('Error: ', error);
        return res.status(400).send({ success: false, error: 'Something went wrong' })
    }
})

function formatPeriod(id) {
    if (id < 10) return '000' + id
    if (id < 100) return '00' + id
    if (id < 1000) return '0' + id

    return id
}

async function getParityId() {
    let date = ("0" + new Date().getDate()).slice(-2);
    let month = ("0" + new Date().getMonth()).slice(-2);
    let year = ("0" + new Date().getFullYear()).slice(-2)
    let a = year + '' + month + '' + date

    let result;
    await fastParityPeriod().then(response => {
        if (response[0].id?.slice(0, 6) === a) {
            result = parseFloat(response[0].id) + 1
        } else {
            result = year + '' + month + '' + date + '0001'
        }
    })

    return result
}

app.get('/game/fastParity', async (req, res) => {
    try {
        fastParityModel.find().sort({ _id: -1 }).limit(25).then(response => {
            res.status(200).send({ success: true, current: `${response[0].id}`, data: response })
        })
    } catch (error) {
        console.log(error)
    }
})

async function fastParityPeriod() {
    try {
        return fastParityModel.find().sort({ _id: -1 }).limit(1)
    } catch (error) {
        console.log(error)
    }
}

app.post('/placeFastParityBet', async (req, res) => {
    try {
        const { amount, period, user } = req.body;
        let select = typeof req.body.select === 'string' ? req.body.select.slice(0, 1) : req.body.select
        console.log(req.body)

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');
        let collection2 = db.collection('balances');

        let response = await collection.findOne({ userToken: user });
        let response2 = await collection2.findOne({ id: response.id });
        let MBalance = parseFloat(response2.mainBalance)
        let DBalance = parseFloat(response2.depositBalance)

        if ((MBalance + DBalance) < amount) {
            return res.status(400).send({ success: false, error: 'Not enough balance' })
        }

        let UPD = new fastParityOrderModel({
            id: response.id,
            period,
            selectType: typeof select === 'string' ? 'color' : 'number',
            select,
            amount
        })

        UPD.save(function (err, result) {
            if (err) return res.status(400).send({ success: false, error: 'Failed to place bet' })

            collection2.findOneAndUpdate({ id: response.id }, {
                $set: {
                    depositBalance: (DBalance - amount) < 0 ? 0 : DBalance - amount,
                    mainBalance: (DBalance - amount) < 0 ? MBalance + (DBalance - amount) : MBalance
                }
            })
        })

        let myOrder = await fastParityOrderModel.find({ id: response.id })
        let newBalance = await balanceModel.findOne({ id: response.id })

        return res.status(200).send({ success: true, amount, period, user: response.id, balance: newBalance.mainBalance + newBalance.depositBalance, type: typeof select === 'string' ? 'color' : 'number', select: select, order: myOrder })
    } catch (error) {
        console.log('Error: ', error);
        return res.status(400).send({ success: false, error: 'Something went wrong'})
    }
})

app.post('/myOrder', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body)

        let user = await userModel.findOne({ userToken: id});
        let myOrder = await fastParityOrderModel.find({ id: user.id })

        return res.status(200).send({ success: true, data: myOrder})
    } catch (error) {
        console.log('Error: ', error);
        return res.status(400).send({ success: false, error: 'Something went wrong'})
    }
})

io.on("connection", (socket) => {
    socket.join('fastParity');

    socket.on("bet", ({ amount, user, period, select, type }) => {
        socket.to('fastParity').emit('betForward', { amount, user, select, type, period })
    });
});

var counter = 30;
setInterval(function () {
    io.sockets.to('fastParity').emit('counter', { counter: counter });
    counter--

    if (counter === 0) {
        fastParityPeriod().then(response => {
            let roomId = parseFloat(response[0].id)
            updateFastParityPeriod(roomId).then((response2) => {
                counter = 30
                io.sockets.to('fastParity').emit('counter', { counter: counter });
            })
        })
    }
}, 1000);

async function updateFastParityPeriod(id) {
    try {
        let result = Math.floor(Math.random() * (9 - 0 + 1)) + 0;
        let resultInColor;
        let isV = false;

        if (result === 1 || result === 3 || result === 5 || result === 7 || result === 9) {
            resultInColor = 'G'

            if (result === 5) {
                isV = true
            }
        } else {
            if (result === 0 || result === 2 || result === 4 || result === 6 || result === 8) {
                resultInColor = 'R'

                if (result === 0) {
                    isV = true
                }
            }
        }

        let newId = await getParityId().then((response) => {
            return response;
        });

        let updatePeriod = await fastParityModel.findOneAndUpdate({ id: id }, { $set: { winner: result } });
        let getPeriod = await fastParityModel.find().sort({ _id: -1 }).limit(26);
        const firstUpdate = await fastParityOrderModel.updateMany({ period: id }, { $set: { result: result } });
        const getFirstItems = await fastParityOrderModel.find({ period: id })

        for (let i = 0; i < getFirstItems.length; i++) {
            if (getFirstItems[i].selectType === 'color') {
                if (getFirstItems[i].select === resultInColor) {
                    await balanceModel.updateOne({ id: getFirstItems[i].id }, { $inc: { mainBalance: getFirstItems[i].amount * 2 } });
                } else {
                    if (getFirstItems[i].select === 'V' && isV) {
                        await balanceModel.updateOne({ id: getFirstItems[i].id }, { $inc: { mainBalance: getFirstItems[i].amount * 4.5 } });
                    }
                }
            } else {
                if (getFirstItems[i].selectType === 'number' && getFirstItems[i].select === result) {
                    await balanceModel.updateOne({ id: getFirstItems[i].id }, { $inc: { mainBalance: getFirstItems[i].amount * 9 } });
                }
            }
        }

        const nData = new fastParityModel({
            id: newId.toString(),
            winner: '10'
        })

        if (getPeriod[25]) {
            await fastParityModel.deleteOne({ id: getPeriod[25].id })
        }

        nData.save()

        io.sockets.to('fastParity').emit('counter', { counter: counter });
        io.sockets.to('fastParity').emit('period', { period: newId });
    } catch (error) {
        console.log(error)
    }
}