const express = require('express');
const app = express();

const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors')
const bodyParser = require('body-parser');
const { MongoClient, ServerApiVersion } = require("mongodb");
const mongoose = require('mongoose');
const axios = require('axios');
const crypto = require("crypto");
var fetch = require('node-fetch-polyfill');

const whitelist = ["https://teslawin-f2b77.web.app", "https://www.apirequest.io", "https://tganand.xyz", "http://192.168.29.34:3000"];
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

//mongodb+srv://teslawinadmin:anand0024@cluster0.ubmxhuq.mongodb.net/?retryWrites=true&w=majority
//mongodb+srv://biomeeadmin:jcxfYgWQKLOzxzhn@cluster0.xgynqbe.mongodb.net/?retryWrites=true&w=majority
const uri = "mongodb+srv://teslawinadmin:anand0024@cluster0.ubmxhuq.mongodb.net/?retryWrites=true&w=majority"
mongoose.connect(uri).then(console.log('connected'))

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: whitelist,
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
});

const dailyRecSchema = new mongoose.Schema({
    id: String,
    date: String,
    amount: Number
})

const refSchema = new mongoose.Schema({
    id: String,
    user: String,
    level: Number,
    date: String,
    totalDeposit: Number,
    bonus: Number
})

const newRefSchema = new mongoose.Schema({
    id: String,
    user: String,
    level: Number,
    commission: Number,
    time: String,
    period: Number,
    image: String,
    title: String
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
    point: Number,
    time: String
})

const diceOrderSchema = new mongoose.Schema({
    id: String,
    period: String,
    amount: Number,
    select: Number,
    result: Number,
    point: Number,
    time: String
})

const balanceSchema = new mongoose.Schema({
    id: String,
    mainBalance: Number,
    depositBalance: Number,
    refBalance: Number
})

const depositSchema = new mongoose.Schema({
    id: String,
    orderId: String,
    amount: Number,
    date: String,
    status: Boolean
})

const orderBookSchema = new mongoose.Schema({
    id: String,
    parity: Number,
    minesweeper: Number,
    dice: Number,
    circle: Number,
    andarBahar: Number
})

const financialSchema = new mongoose.Schema({
    id: String,
    title: String,
    date: String,
    amount: Number,
    type: Boolean,
    image: String
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

const diceSchema = new mongoose.Schema({
    id: String,
    result: String
})

const minesweeperSchema = new mongoose.Schema({
    period: String,
    size: Number,
    status: Boolean,
    win: Boolean,
    checked: {
        type: Array,
        default: []
    },
    amount: Number,
    bomb: Number,
    ATN: Number,
    NCA: Number,
    id: String,
    betId: String
})


const newRefModel = mongoose.model('newref', newRefSchema)
const orderBookModel = mongoose.model('order', orderBookSchema)
const financialModel = mongoose.model('financial', financialSchema)
const sweeperModel = mongoose.model('minesweeper', minesweeperSchema)
const userModel = mongoose.model('user', userSchema)
const balanceModel = mongoose.model('balance', balanceSchema);
const addCardModel = mongoose.model('account', addCardSchema);
const fastParityModel = mongoose.model('fastParity', fastParitySchema)
const fastParityOrderModel = mongoose.model('fastParityOrder', fastParityOrderSchema)
const diceModel = mongoose.model('dice', diceSchema)
const diceOrderModel = mongoose.model('diceOrder', diceOrderSchema)
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
        let collection4 = db.collection('totalreferrals');

        let per = ("0" + new Date().getDate()).slice(-2) + "" + ("0" + new Date().getMonth() + 1).slice(-2) + "" + ("0" + new Date().getFullYear()).slice(-4)

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
        let m = ("0" + d.getMonth() + 1).slice(-2)
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
        });

        const o = new orderBookModel({
            id: uid,
            parity: 0,
            minesweeper: 0,
            dice: 0,
            circle: 0,
            andarBahar: 0
        })

        const fi = new financialModel({
            id: uid,
            title: 'Registration Bonus',
            date: m + '/' + d2 + ' ' + h + ':' + m2,
            amount: 10,
            type: true,
            image: 'https://res.cloudinary.com/fiewin/image/upload/images/checkInReward.png'
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

        let lv1Data, lv2Data, lv3Data, newRef;
        if (lv1) {
            lv1Data = new refModel({
                id: lv1,
                user: uid,
                level: 1,
                date: `${d2}/${m}/${y} ${h}:${m2}`,
                totalDeposit: 0,
                bonus: 1
            });

            newRef = new newRefModel({
                id: lv1,
                user: uid,
                level: 1,
                commission: 1,
                time: m + '/' + d2 + ' ' + ("0" + (new Date().getHours() + 1)).slice(-2) + ':' + ("0" + (new Date().getMinutes() + 1)).slice(-2),
                period: parseFloat(per),
                image: 'https://res.cloudinary.com/fiewin/image/upload/images/Cash.png',
                title: 'Invite cashback'
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
        fi.save()
        o.save()

        if (lv1) {
            collection3.findOneAndUpdate({ id: lv1 }, { $inc: { refBalance: 1 } })
            collection4.findOneAndUpdate({ id: lv1 }, { $inc: { lv1: 1 } })
            lv1Data.save()
            newRef.save()
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
            collection2.findOne({ id: response?.id }).then(response2 => {
                return res.status(200).send({ success: true, withdraw: response2?.mainBalance.toFixed(2), deposit: response2?.depositBalance.toFixed(2), referral: response2?.refBalance.toFixed(2) })
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

        const user = await userModel.findOne({ userToken: id });
        const records = await withdrawalModel.find({ id: user.id })

        if (records.length === 0) return res.status(200).send({ success: true, records: false })

        return res.status(200).send({ success: true, records: true, data: records })
    } catch (error) {
        console.log('Error: ', error);
        return res.status(400).send({ success: false, error: 'Something went wrong' })
    }
})

app.post('/withdraw', async (req, res) => {
    try {
        const { id, amount, type } = req.body;
        console.log(req.body)

        const user = await userModel.findOne({ userToken: id });
        const balance = await balanceModel.findOne({ id: user.id });
        const card = await addCardModel.findOne({ id: user.id, isActive: true });

        if (type) {
            if (amount < 35) return res.status(400).send({ success: false, error: 'Unable to make withdrawal request' })
            if (balance.mainBalance < parseFloat(amount)) return res.status(400).send({ success: false, error: 'Insufficient Balance' })
        } else {
            if (amount < 31) return res.status(400).send({ success: false, error: 'Unable to make withdrawal request' })
            if (balance.refBalance < parseFloat(amount)) return res.status(400).send({ success: false, error: 'Insufficient Balance' })
        }

        let fee = 0;
        if (type && amount < 1500) {
            fee = 30
        } else {
            fee = (amount * (2 / 100))
        }

        if (!card) return res.status(400).send({ success: false, error: 'No active payment method' })

        let date = new Date();
        let l = ("0" + (date.getMonth() + 1)).slice(-2) + '/' + ("0" + (date.getDate())).slice(-2) + ' ' + ("0" + (date.getHours())).slice(-2) + ':' + ("0" + (date.getMinutes())).slice(-2)
        let rNumber = Math.floor(Math.random() * 10000)
        let eDate = date.getFullYear() + '' + ("0" + date.getMonth()).slice(-2) + '' + ("0" + date.getDate()).slice(-2) + '' + ("0" + date.getHours()).slice(-2) + '' + ("0" + date.getMinutes()).slice(-2) + '' + ("0" + date.getSeconds()).slice(-2) + '' + ("0" + date.getMilliseconds()).slice(-2) + '' + rNumber

        if (card.isBank === true) {
            let data = new withdrawalModel({
                id: user.id,
                amount: parseFloat(amount) - fee,
                status: 'Pending',
                isBank: true,
                name: card.name,
                account: card.account,
                ifsc: card.ifsc,
                wid: parseFloat(eDate),
                fee: fee,
                date: ("0" + date.getMonth()).slice(-2) + '/' + ("0" + date.getDate()).slice(-2) + ' ' + ("0" + date.getHours()).slice(-2) + ':' + ("0" + date.getMinutes()).slice(-2)
            })

            data.save()
        } else {
            let data = new withdrawalModel({
                id: user.id,
                amount: parseFloat(amount) - fee,
                status: 'Pending',
                isBank: false,
                name: card.name,
                upi: card.upi,
                wid: parseFloat(eDate),
                fee: fee,
                date: ("0" + date.getMonth()).slice(-2) + '/' + ("0" + date.getDate()).slice(-2) + ' ' + ("0" + date.getHours()).slice(-2) + ':' + ("0" + date.getMinutes()).slice(-2)
            })

            data.save()
        }

        const fi = new financialModel({
            id: user.id,
            title: 'Withdraw',
            date: l,
            amount: amount - fee,
            type: false,
            image: 'https://res.cloudinary.com/fiewin/image/upload/images/withDraw.png'
        })

        const fi2 = new financialModel({
            id: user.id,
            title: 'Withdraw fee',
            date: l,
            amount: fee,
            type: false,
            image: 'https://res.cloudinary.com/fiewin/image/upload/images/withDrawFee.png'
        })

        if (type) {
            await balanceModel.updateOne({ id: user.id }, {
                $inc: {
                    mainBalance: -parseFloat(amount)
                }
            })
        } else {
            await balanceModel.updateOne({ id: user.id }, {
                $inc: {
                    refBalance: -parseFloat(amount)
                }
            })
        }

        fi.save()
        fi2.save()

        return res.status(200).send({ success: true })
    } catch (error) {
        console.log('Error: ', error);
        return res.status(400).send({ success: false, error: 'Something went wrong' })
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
        const deposit = await depositModel.find({ id: user.id, status: true })
        const invite = await totalRefModel.findOne({ id: user.id })
        const order = await orderBookModel.findOne({ id: user.id })

        if (task === 'TASK0001') {
            if (deposit.length === 0) return res.status(400).send({ success: false, error: 'Failed to verify task.' })
        }

        if (task === 'TASK0002') {
            if (invite.lv1 === 0) return res.status(400).send({ success: false, error: 'Failed to verify task.' })
        }

        if (task === 'TASK0003') {
            if ((order.parity + order.dice) < 100) return res.status(400).send({ success: false, error: 'Failed to verify task.' })
        }

        if (task === 'TASK0004') {
            if ((order.parity + order.dice) < 1000) return res.status(400).send({ success: false, error: 'Failed to verify task.' })
        }

        if (task === 'TASK0005') {
            if ((order.parity + order.dice) < 10000) return res.status(400).send({ success: false, error: 'Failed to verify task.' })
        }

        if (t && t[task]) return res.status(400).send({ success: false, error: 'Failed to verify task.' })

        const fi = new financialModel({
            id: user.id,
            title: 'Task Income',
            date: ("0" + (new Date().getMonth() + 1)).slice(-2) + '/' + ("0" + (new Date().getDate())).slice(-2) + ' ' + ("0" + (new Date().getHours())).slice(-2) + ':' + ("0" + (new Date().getMinutes())).slice(-2),
            amount: bonus[task],
            type: true,
            image: 'https://res.cloudinary.com/fiewin/image/upload/images/learnReward.png'
        })

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

        fi.save()

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
        const deposit = await depositModel.find({ id: user.id, status: true })
        const invite = await totalRefModel.findOne({ id: user.id })
        const order = await orderBookModel.findOne({ id: user.id })
        const task = await taskModel.findOne({ id: user.id })

        return res.status(200).send({ success: true, deposit: deposit.length > 0 ? true : false, invite: invite.lv1 > 0 ? true : false, order: order.parity + order.dice, task: task })
    } catch (error) {
        console.log('Error: ', error)
    }
});

app.post('/team', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body);

        const user = await userModel.findOne({ userToken: id })
        const totalRef = await totalRefModel.findOne({ id: user.id })
        const lv1 = await refModel.find({ id: user.id, level: 1 })
        const lv2 = await refModel.find({ id: user.id, level: 2 })
        const lv3 = await refModel.find({ id: user.id, level: 3 })

        return res.status(200).send({ success: true, t1: totalRef.lv1, t2: totalRef.lv2, t3: totalRef.lv3, d1: lv1, d2: lv2, d3: lv3 })
    } catch (error) {
        console.log('Error: ', error);
        return res.status(400).send({ success: false, error: 'Something went wrong' })
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
        const dateF = ("0" + newDate.getFullYear()).slice(-2) + '' + ("0" + newDate.getMonth() + 1).slice(-2) + '' + ("0" + newDate.getDate()).slice(-2)
        const aDate = parseFloat(dateF)

        const nDate = new Date(Date.now() + (3600 * 1000 * 24))
        const dateN = ("0" + nDate.getFullYear()).slice(-2) + '' + ("0" + nDate.getMonth() + 1).slice(-2) + '' + ("0" + nDate.getDate()).slice(-2)

        let response = await collection.findOne({ userToken: id });
        let response3 = await collection2.findOne({ id: response?.id });
        let date = response3?.date;
        let day = aDate === date ? response3.day : 0

        const fi = new financialModel({
            id: response?.id,
            title: 'CheckIn Bonus',
            date: ('0' + newDate.getMonth()).slice(-2) + '/' + ('0' + newDate.getDate()).slice(-2) + ' ' + ('0' + newDate.getHours()).slice(-2) + ':' + ('0' + newDate.getMinutes()).slice(-2),
            amount: day === 0 ? 1 : day === 1 || day === 2 || day === 3 ? 2 : 3,
            type: true,
            image: 'https://res.cloudinary.com/fiewin/image/upload/images/checkInReward.png'
        })

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

            fi.save()

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
});

app.post('/fetchRefDetail', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body);

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');
        let collection2 = db.collection('newrefs');

        let per = ("0" + new Date().getDate()).slice(-2) + "" + ("0" + new Date().getMonth() + 1).slice(-2) + "" + ("0" + new Date().getFullYear()).slice(-4)

        let resp = await collection.findOne({ userToken: id });
        let a = await collection2.find({ id: resp.id, period: parseFloat(per) }).toArray()
        let b = await collection2.find({ id: resp.id }).toArray()
        let c = await collection2.find({ id: resp.id }).sort({ _id: -1 }).limit(10).toArray()

        var total = 0;
        for (var i in a) {
            total += a[i].commission;
        }

        var total2 = 0;
        for (var i in b) {
            total2 += b[i].commission;
        }

        function eliminateDuplicates(arr) {
            var i,
                len = arr.length,
                out = [],
                obj = {};

            for (i = 0; i < len; i++) {
                obj[arr[i].user] = 0;
            }
            for (i in obj) {
                out.push(i);
            }
            return out;
        }

        return res.status(200).send({ success: true, todayInv: eliminateDuplicates(a).length, todayInc: total, totalInv: eliminateDuplicates(b).length, totalInc: total2, data: c })
    } catch (error) {

    }
});

app.post('/fetchReff', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body);

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');
        let collection2 = db.collection('newrefs');

        let per = ("0" + new Date().getDate()).slice(-2) + "" + ("0" + new Date().getMonth() + 1).slice(-2) + "" + ("0" + new Date().getFullYear()).slice(-4)

        let resp = await collection.findOne({ userToken: id });
        let c = await collection2.find({ id: resp.id }).sort({ _id: -1 }).toArray();

        return res.status(200).send({ success: false, data: c })
    } catch (error) {

    }
});

app.post('/fetchDailyRec', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body)

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');
        let collection2 = db.collection('dailyrecs');;

        let resp = await collection.findOne({ userToken: id });
        let c = await collection2.find({ id: resp.id }).sort({ _id: -1 }).toArray();

        return res.status(200).send({ success: true, data: c })
    } catch (error) {

    }
})

app.post('/fetchFinancialRecords', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body);

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');
        let collection2 = db.collection('financials');

        let d = await collection.findOne({ userToken: id })

        financialModel.find({ id: d.id }).sort({ _id: -1 }).limit(10).then((response) => {
            return res.status(200).send({ success: true, data: response })
        })
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
                        orderId: data.ORDERID,
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
    let month = ("0" + (new Date().getMonth() + 1)).slice(-2);
    let year = ("0" + new Date().getFullYear()).slice(-2)
    let a = year + '' + month + '' + date

    let data = await fastParityPeriod()
    if (data.length === 0 || data[0]?.id?.slice(0, 6) !== a) return year + '' + month + '' + date + '0001'
    return parseFloat(data[0].id) + 1
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
        let collection5 = db.collection('orders')

        let response = await collection.findOne({ userToken: user });
        let response2 = await collection2.findOne({ id: response.id });
        let MBalance = parseFloat(response2.mainBalance)
        let DBalance = parseFloat(response2.depositBalance)

        if (amount < 10) {
            return res.status(400).send({ success: false, error: 'Unable to place bet' })
        }

        if ((MBalance + DBalance) < amount) {
            return res.status(400).send({ success: false, error: 'Not enough balance' })
        }

        let per = ("0" + new Date().getDate()).slice(-2) + "" + ("0" + new Date().getMonth() + 1).slice(-2) + "" + ("0" + new Date().getFullYear()).slice(-4)

        let date = ("0" + new Date().getDate()).slice(-2);
        let month = ("0" + (new Date().getMonth() + 1)).slice(-2);
        let h = ("0" + (new Date().getHours() + 1)).slice(-2) + ':' + ("0" + (new Date().getMinutes() + 1)).slice(-2) + ':' + ("0" + (new Date().getSeconds() + 1)).slice(-2)

        let UPD = new fastParityOrderModel({
            id: response.id,
            period,
            selectType: typeof select === 'string' ? 'color' : 'number',
            select,
            amount,
            time: month + '/' + date + ' ' + h
        })

        let newRef1, newRef2, newRef3;
        if (response.lv1) {
            newRef1 = new newRefModel({
                id: response.lv1,
                user: response.id,
                level: 1,
                commission: amount * (1 / 100),
                time: month + '/' + date + ' ' + ("0" + (new Date().getHours() + 1)).slice(-2) + ':' + ("0" + (new Date().getMinutes() + 1)).slice(-2),
                period: parseFloat(per),
                image: 'https://res.cloudinary.com/fiewin/image/upload/images/lv1.png',
                title: 'level-1 Order Commission'
            })
        }

        if (response.lv2) {
            newRef2 = new newRefModel({
                id: response.lv2,
                user: response.id,
                level: 2,
                commission: amount * (0.5 / 100),
                time: month + '/' + date + ' ' + ("0" + (new Date().getHours() + 1)).slice(-2) + ':' + ("0" + (new Date().getMinutes() + 1)).slice(-2),
                period: parseFloat(per),
                image: 'https://res.cloudinary.com/fiewin/image/upload/images/lv2.png',
                title: 'level-2 Order Commission'
            })
        }

        if (response.lv3) {
            newRef3 = new newRefModel({
                id: response.lv3,
                user: response.id,
                level: 3,
                commission: amount * (0.25 / 100),
                time: month + '/' + date + ' ' + ("0" + (new Date().getHours() + 1)).slice(-2) + ':' + ("0" + (new Date().getMinutes() + 1)).slice(-2),
                period: parseFloat(per),
                image: 'https://res.cloudinary.com/fiewin/image/upload/images/lv3.png',
                title: 'level-3 Order Commission'
            })
        }

        const fi = new financialModel({
            id: response.id,
            title: 'Fast Parity Order Expense',
            date: month + '/' + date + ' ' + ("0" + (new Date().getHours() + 1)).slice(-2) + ':' + ("0" + (new Date().getMinutes() + 1)).slice(-2),
            amount: amount,
            type: false,
            image: 'https://res.cloudinary.com/fiewin/image/upload/images/FastParityExpense.png'
        });

        UPD.save(function (err, result) {
            if (err) return res.status(400).send({ success: false, error: 'Failed to place bet' })

            collection2.findOneAndUpdate({ id: response.id }, {
                $set: {
                    depositBalance: (DBalance - amount) < 0 ? 0 : DBalance - amount,
                    mainBalance: (DBalance - amount) < 0 ? MBalance + (DBalance - amount) : MBalance
                }
            })

            collection5.findOneAndUpdate({ id: response.id }, {
                $inc: {
                    parity: 1
                }
            })

            fi.save()

            if (response.lv1) {
                newRef1.save()
                collection2.findOneAndUpdate({ id: response.lv1 }, {
                    $inc: {
                        refBalance: amount * (2 / 100)
                    }
                });
            }

            if (response.lv2) {
                newRef2.save()
                collection2.findOneAndUpdate({ id: response.lv2 }, {
                    $inc: {
                        refBalance: amount * (1 / 100)
                    }
                })
            }

            if (response.lv3) {
                newRef3.save()
                collection2.findOneAndUpdate({ id: response.lv3 }, {
                    $inc: {
                        refBalance: amount * (0.5 / 100)
                    }
                })
            }
        })

        return res.status(200).send({ success: true, amount, period, user: response.id, type: typeof select === 'string' ? 'color' : 'number', select: select })
    } catch (error) {
        console.log('Error: ', error);
        return res.status(400).send({ success: false, error: 'Something went wrong' })
    }
})

app.post('/myOrder', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body)

        let user = await userModel.findOne({ userToken: id });
        let myOrder = await fastParityOrderModel.find({ id: user.id }).sort({ _id: -1 }).limit(25)

        return res.status(200).send({ success: true, data: myOrder })
    } catch (error) {
        console.log('Error: ', error);
        return res.status(400).send({ success: false, error: 'Something went wrong' })
    }
})

io.on("connection", (socket) => {
    socket.join('fastParity');
    socket.join('dice');

    socket.on("bet", ({ amount, user, period, select, type }) => {
        socket.to('fastParity').emit('betForward', { amount, user, select, type, period })
    });

    socket.on("betDice", ({ amount, user, period, select }) => {
        socket.to('dice').emit('betForwardDice', { amount, user, select, period })
    });
});

var counter = 30;
setInterval(function () {
    io.sockets.to('fastParity').emit('counter', { counter: counter });
    counter--

    if (counter === 0) {
        fastParityPeriod().then(response => {
            let roomId = parseFloat(response[0]?.id)
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
            let al;
            if (getFirstItems[i].selectType === 'color') {
                if (getFirstItems[i].select === resultInColor) {
                    al = getFirstItems[i].amount * 2
                    await balanceModel.updateOne({ id: getFirstItems[i].id }, { $inc: { mainBalance: getFirstItems[i].amount * 2 } });
                } else {
                    if (getFirstItems[i].select === 'V' && isV) {
                        al = getFirstItems[i].amount * 4.5
                        await balanceModel.updateOne({ id: getFirstItems[i].id }, { $inc: { mainBalance: getFirstItems[i].amount * 4.5 } });
                    }
                }
            } else {
                if (getFirstItems[i].selectType === 'number' && getFirstItems[i].select === result) {
                    al = getFirstItems[i].amount * 9
                    await balanceModel.updateOne({ id: getFirstItems[i].id }, { $inc: { mainBalance: getFirstItems[i].amount * 9 } });
                }
            }

            let getD = await userModel.findOne({ id: getFirstItems[i].id })

            const fi = new financialModel({
                id: getFirstItems[i].id,
                title: 'Fast Parity Income',
                date: ("0" + (new Date().getMonth() + 1)).slice(-2) + '/' + ("0" + (new Date().getDate())).slice(-2) + ' ' + ("0" + (new Date().getHours() + 1)).slice(-2) + ':' + ("0" + (new Date().getMinutes() + 1)).slice(-2),
                amount: al,
                type: true,
                image: 'https://res.cloudinary.com/fiewin/image/upload/images/FastParityIncome.png'
            })

            fi.save()

            io.sockets.to('fastParity').emit('result', { token: getD.userToken, period: id, price: 19975.01, type: getFirstItems[i].selectType === 'color' ? true : false, select: getFirstItems[i].select, point: getFirstItems[i].amount, result });
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


//dice
app.get('/game/dice', async (req, res) => {
    try {
        diceModel.find().sort({ _id: -1 }).limit(25).then(response => {
            res.status(200).send({ success: true, current: `${response[0].id}`, data: response })
        })
    } catch (error) {
        console.log(error)
    }
})

app.post('/myOrder/dice', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body)

        let user = await userModel.findOne({ userToken: id });
        let myOrder = await diceOrderModel.find({ id: user?.id }).sort({ _id: -1 }).limit(25)

        return res.status(200).send({ success: true, data: myOrder })
    } catch (error) {
        console.log('Error: ', error);
        return res.status(400).send({ success: false, error: 'Something went wrong' })
    }
})

app.post('/placeDiceBet', async (req, res) => {
    try {
        const { amount, period, user, select } = req.body;
        console.log(req.body)

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');
        let collection2 = db.collection('balances');
        let collection5 = db.collection('orders')

        let response = await collection.findOne({ userToken: user });
        let response2 = await collection2.findOne({ id: response.id });
        let MBalance = parseFloat(response2.mainBalance)
        let DBalance = parseFloat(response2.depositBalance)

        if (amount < 10) {
            return res.status(400).send({ success: false, error: 'Unable to place bet' })
        }

        if ((MBalance + DBalance) < amount) {
            return res.status(400).send({ success: false, error: 'Not enough balance' })
        }

        let date = ("0" + new Date().getDate()).slice(-2);
        let month = ("0" + (new Date().getMonth() + 1)).slice(-2);
        let h = ("0" + (new Date().getHours() + 1)).slice(-2) + ':' + ("0" + (new Date().getMinutes() + 1)).slice(-2) + ':' + ("0" + (new Date().getSeconds() + 1)).slice(-2)

        let per = ("0" + new Date().getDate()).slice(-2) + "" + ("0" + new Date().getMonth() + 1).slice(-2) + "" + ("0" + new Date().getFullYear()).slice(-4)

        let UPD = new diceOrderModel({
            id: response.id,
            period,
            select: parseFloat(select),
            amount,
            time: month + '/' + date + ' ' + h
        })

        let newRef1, newRef2, newRef3;
        if (response.lv1) {
            newRef1 = new newRefModel({
                id: response.lv1,
                user: response.id,
                level: 1,
                commission: amount * (2 / 100),
                time: month + '/' + date + ' ' + ("0" + (new Date().getHours() + 1)).slice(-2) + ':' + ("0" + (new Date().getMinutes() + 1)).slice(-2),
                period: parseFloat(per),
                image: 'https://res.cloudinary.com/fiewin/image/upload/images/lv1.png',
                title: 'level-1 Order Commission'
            })
        }

        if (response.lv2) {
            newRef2 = new newRefModel({
                id: response.lv2,
                user: response.id,
                level: 2,
                commission: amount * (1 / 100),
                time: month + '/' + date + ' ' + ("0" + (new Date().getHours() + 1)).slice(-2) + ':' + ("0" + (new Date().getMinutes() + 1)).slice(-2),
                period: parseFloat(per),
                image: 'https://res.cloudinary.com/fiewin/image/upload/images/lv2.png',
                title: 'level-2 Order Commission'
            })
        }

        if (response.lv3) {
            newRef3 = new newRefModel({
                id: response.lv3,
                user: response.id,
                level: 3,
                commission: amount * (0.5 / 100),
                time: month + '/' + date + ' ' + ("0" + (new Date().getHours() + 1)).slice(-2) + ':' + ("0" + (new Date().getMinutes() + 1)).slice(-2),
                period: parseFloat(per),
                image: 'https://res.cloudinary.com/fiewin/image/upload/images/lv3.png',
                title: 'level-3 Order Commission'
            })
        }

        const fi = new financialModel({
            id: response.id,
            title: 'Dice Order Expense',
            date: ("0" + (new Date().getMonth() + 1)).slice(-2) + '/' + ("0" + (new Date().getDate())).slice(-2) + ' ' + ("0" + (new Date().getHours() + 1)).slice(-2) + ':' + ("0" + (new Date().getMinutes() + 1)).slice(-2),
            amount: amount,
            type: false,
            image: 'https://res.cloudinary.com/fiewin/image/upload/images/diceExpense.png'
        })

        UPD.save(function (err, result) {
            if (err) return res.status(400).send({ success: false, error: 'Failed to place bet' })

            collection2.findOneAndUpdate({ id: response.id }, {
                $set: {
                    depositBalance: (DBalance - amount) < 0 ? 0 : DBalance - amount,
                    mainBalance: (DBalance - amount) < 0 ? MBalance + (DBalance - amount) : MBalance
                }
            })

            collection5.findOneAndUpdate({ id: response.id }, {
                $inc: {
                    dice: 1
                }
            })

            fi.save()

            if (response.lv1) {
                newRef1.save()
                collection2.findOneAndUpdate({ id: response.lv1 }, {
                    $inc: {
                        refBalance: amount * (2 / 100)
                    }
                })
            }

            if (response.lv2) {
                newRef2.save()
                collection2.findOneAndUpdate({ id: response.lv2 }, {
                    $inc: {
                        refBalance: amount * (1 / 100)
                    }
                })
            }

            if (response.lv3) {
                newRef3.save()
                collection2.findOneAndUpdate({ id: response.lv3 }, {
                    $inc: {
                        refBalance: amount * (0.5 / 100)
                    }
                })
            }
        })

        return res.status(200).send({ success: true, amount, period, user: response.id, select: select })
    } catch (error) {
        console.log('Error: ', error);
        return res.status(400).send({ success: false, error: 'Something went wrong' })
    }
})

async function dicePeriod() {
    try {
        let data = await diceModel.find().sort({ _id: -1 }).limit(1)
        return data;
    } catch (error) {
        console.log(error)
    }
}

async function getDiceId() {
    let date = ("0" + new Date().getDate()).slice(-2);
    let month = ("0" + (new Date().getMonth() + 1)).slice(-2);
    let year = ("0" + new Date().getFullYear()).slice(-2)
    let a = year + '' + month + '' + date

    let data = await dicePeriod()
    if (data.length === 0 || data[0].id?.slice(0, 6) !== a) return year + '' + month + '' + date + '0001'
    return parseFloat(data[0].id) + 1
}

var counter2 = 60;
setInterval(function () {
    io.sockets.to('dice').emit('counterDice', { counter: counter2 });
    counter2--

    if (counter2 === 0) {
        dicePeriod().then(response => {
            let roomId = parseFloat(response[0]?.id)

            updateDicePeriod(roomId).then((response2) => {
                counter2 = 60
                io.sockets.to('dice').emit('counterDice', { counter: counter2 });
            })
        })
    }
}, 1000);

async function updateDicePeriod(id) {
    try {
        let result = Math.floor(Math.random() * 100);

        let newId = await getDiceId().then((response) => {
            return response;
        });

        let updatePeriod = await diceModel.findOneAndUpdate({ id: id }, { $set: { result: result } });
        let getPeriod = await diceModel.find().sort({ _id: -1 }).limit(26);
        const firstUpdate = await diceOrderModel.updateMany({ period: id }, { $set: { result: result } });
        const getFirstItems = await diceOrderModel.find({ period: id })

        for (let i = 0; i < getFirstItems.length; i++) {
            let m = (95 / getFirstItems[i].select).toFixed(2)
            if (result < getFirstItems[i].select) {
                await balanceModel.updateOne({ id: getFirstItems[i].id }, { $inc: { mainBalance: getFirstItems[i].amount * m } });

                const fi = new financialModel({
                    id: getFirstItems[i].id,
                    title: 'Dice Income',
                    date: ("0" + (new Date().getMonth() + 1)).slice(-2) + '/' + ("0" + (new Date().getDate())).slice(-2) + ' ' + ("0" + (new Date().getHours() + 1)).slice(-2) + ':' + ("0" + (new Date().getMinutes() + 1)).slice(-2),
                    amount: getFirstItems[i].amount * m,
                    type: true,
                    image: 'https://res.cloudinary.com/fiewin/image/upload/images/diceIncome.png'
                })

                fi.save()
            }

            let getD = await userModel.findOne({ id: getFirstItems[i].id })
            io.sockets.to('dice').emit('result2', { token: getD.userToken, period: id, price: 19975.01, select: getFirstItems[i].select, point: getFirstItems[i].amount, result });
        }

        const nData = new diceModel({
            id: newId.toString(),
            result: '100'
        })

        if (getPeriod[25]) {
            await diceModel.deleteOne({ id: getPeriod[25].id })
        }

        nData.save()

        io.sockets.to('dice').emit('counterDice', { counter: counter });
        io.sockets.to('dice').emit('periodDice', { period: newId });
    } catch (error) {
        console.log(error)
    }
}


// Minesweeper
app.post('/placeSweeperBet', async (req, res) => {
    try {
        const { amount, size, user } = req.body;
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

        let D = new Date()
        let period = ("0" + new Date().getHours()).slice(-2) + '' + ("0" + new Date().getMinutes()).slice(-2)

        let bomb;
        if (size === 1) {
            bomb = Math.floor(Math.random() * (4 - 1 + 1)) + 1
        } else {
            if (size === 2) {
                bomb = Math.floor(Math.random() * (16 - 1 + 1)) + 1
            } else {
                if (size === 3) {
                    bomb = Math.floor(Math.random() * (64 - 1 + 1)) + 1
                }
            }
        }

        let betId = ("0" + new Date().getDate()).slice(-2) + '' + ("0" + new Date().getMonth()).slice(-2) + '' + ("0" + new Date().getFullYear()).slice(-2) + '' + ("0" + new Date().getHours()).slice(-2) + '' + ("0" + new Date().getMinutes()).slice(-2) + '' + ("0" + new Date().getSeconds()).slice(-2)

        let UPD = new sweeperModel({
            period,
            size,
            status: false,
            bomb,
            ATN: 0,
            NCA: 1,
            id: response.id,
            amount: amount,
            betId
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

        return res.status(200).send({ success: true, id: betId, amount: amount, ATN: 0, NCA: 1 })
    } catch (error) {
        console.log('Error: \n', error)
    }
});

app.post('/pendingSweeperGame', async (req, res) => {
    try {
        const { id } = req.body;
        console.log(req.body)

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');

        let response = await collection.findOne({ userToken: id });
        let response3 = await sweeperModel.find({ id: response?.id }).sort({ createdAt: -1 }).limit(1)
        let response2 = response3[0]

        if (!response3[0] || response2.status) return res.status(200).send({ success: true, playing: false });

        return res.status(200).send({ success: true, playing: true, size: response2.size, checked: response2.checked, amount: response2.amount, ATN: response2.ATN, NCA: response2.NCA, id: response2.betId })
    } catch (error) {
        console.log('Error: \n', error)
    }
})

app.post('/claimBox', async (req, res) => {
    try {
        const { user, box, id } = req.body;
        console.log(req.body);

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');
        let collection2 = db.collection('minesweepers');

        let response = await collection.findOne({ userToken: user });
        let response2 = await collection2.findOne({ id: response?.id, betId: id });

        let bombNo = response2.bomb;
        if (bombNo === box) {
            await collection2.findOneAndUpdate({ id: response.id, betId: id }, {
                $set: {
                    status: true,
                    win: false
                }
            })

            return res.status(200).send({ success: true, bomb: true })
        }

        if (response2?.checked.includes(box)) return res.status(200).send({ success: true, bomb: false })

        await collection2.findOneAndUpdate({ id: response.id, betId: id }, {
            $inc: {
                ATN: 1
            },
            $push: {
                checked: box
            }
        })

        let nxt = await collection2.findOne({ id: response?.id, betId: id });

        return res.status(200).send({ success: true, bomb: false, checked: nxt?.checked, amount: nxt?.amount, ATN: nxt?.NTA, NCA: nxt?.NCA })
    } catch (error) {
        console.log(error)
    }
})







app.post('/r', async (req, res) => {
    try {
        const { id, amount } = req.body;
        console.log(req.body);

        let result = await client.connect()
        let db = result.db('test')
        let collection = db.collection('users');

        let response = await collection.findOne({ userToken: id });

        function randomString(length, chars) {
            var result = '';
            for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
            return result;
        }

        const uid = randomString(15, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ')
        let per = ("0" + new Date().getDate()).slice(-2) + "/" + ("0" + new Date().getMonth() + 1).slice(-2) + "/" + ("0" + new Date().getFullYear()).slice(-4) + " " + ("0" + new Date().getHours()).slice(-2) + ":" + ("0" + new Date().getMinutes()).slice(-2)

        let o = new depositModel({
            id: response?.id,
            orderId: uid,
            amount: amount,
            date: per,
            status: false
        })

        let d = await axios.post(`http://43.205.82.74/crt2.php`, { amount: 100, order: uid, url: 'https://tganand.xyz/vf122.php' })

        o.save()
        return res.status(200).send({ success: true, url: d.data.payurl })
    } catch (error) {
        console.log('Error: \n', error)
        return res.status(400).send({ success: false, error: 'Failed to make deposit.' })
    }
});

app.post('/r2', async (req, res) => {
    try {
        const { order } = req.body;
        console.log(req.body);

        let result = await client.connect()
        let db = result.db('test');
        let collection = db.collection('users');
        let collection2 = db.collection('deposits');
        let collection3 = db.collection('balances');
        let collection4 = db.collection('referrals');

        let response = await collection2.findOne({ orderId: order });
        let response2 = await collection.findOne({ id: response?.id });
        if (response?.status === false) return res.status(400).send({ success: false, error: 'Unable to complete deposit'});

        await collection3.updateOne({ id: response?.id }, {
            $inc: {
                depositBalance: response?.amount
            }
        })

        await collection2.updateOne({ id: response?.id }, {
            $set: {
                status: true
            }
        });

        await collection4.updateOne({ user: response?.id }, {
            $inc: {
                totalDeposit: response?.amount
            }
        })

        return res.status(200).send({ success: true })
    } catch (error) {
        console.log('Error: \n', error);
        return res.status(200).send({ success: false, error: 'Failed to fetch order' })
    }
})