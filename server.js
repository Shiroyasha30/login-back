const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors')
const knex = require('knex');


var knex=knex({
  client: 'pg',
  connection: {
    connectionString : process.env.DATABASE_URL,
    ssl : true
  }
});

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res)=>{
	res.send("--ROOT--")
})

app.post('/signin', (req, res)=>{
	const {email, pswd} = req.body;
	knex.select('email', 'pswd').from('login')
	.where({
		email: email
	})
	.then(data => {
		const sign = bcrypt.compareSync(pswd, data[0].pswd);
		if(sign)
		{
			var count=0;
			knex.select("cnt").from('users')
			.where({
				email: email
			})
			.then(dat => {
				count=dat[0].cnt+1;
				console.log(count)
				knex('users')
				.update({
					cnt : count
				})
				.where({
					email: email
				})
				.then(console.log)
			})
			knex.select('*').from('users')
			.where({
				email: email
			})
			.then(user => {
				res.json(user[0]);
			})
			.catch(err => res.json('Error Fetching Data !!'))
		}
		else
		{
			res.json('Wrong Input !!')
		}
	})
	.catch(err => res.json('Error Signing In !!'))
})

app.post('/register', (req, res)=>{
	const {name, email, pswd} = req.body;

	var hash = bcrypt.hashSync(pswd);


	/*knex('login')
	.returning('email')
	.insert({
		pswd: hash,
		email: email
	})
	.then(em => {
		return knex('users')
		.returning('*')
		.insert({
			name: name,
			email: email
		})
		.then(resp => {
			res.json(resp[0]);
		})
		.catch(err => {
			res.json('errorr');
		})
	})
	.catch(err => {
		res.json('errorr');
	})*/

	knex.transaction(trx => {
		trx.insert({
			email: email,
			pswd: hash
		})
		.into('login')
		.returning('email')
		.then(em => {
			return trx('users')
			.returning('*')
			.insert({
				name: name,
				email: em[0],
			})
			.then(user => {
				res.json(user[0]);
			})
		})
		.then(trx.commit)
		.catch(trx.rollback)
	})
	.catch(err => {
		res.json('errorrr')
	})

})

// app.get('/profile/:id', (req, res)=>{
// 	const {id} = req.params;
// 	let fg = 0;
// 	db.users.forEach(user=>{
// 		if(user.id === id)
// 		{
// 			user.cnt+=1;
// 			fg = 1;
// 			res.json(user);
// 		}
// 	})
// 	if(!fg)
// 	{
// 		res.json('not found');
// 	}
// })

app.listen(process.env.PORT || 3000, () => {
	console.log(`port = ${process.env.PORT}`);
})



/*
 * / -> 
 * sign -> signed/not
 * register -> post user
*/
