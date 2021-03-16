const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors')
const knex = require('knex')({
  client: 'mysql',
  connection: {
    host : '127.0.0.1',
    user : 'yash',
    password : 'pswd',
    database : 'db'
  }
});

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res)=>{
	res.json('--ROOT--');
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


	knex('login')
	.insert({
		email: email,
		pswd: hash
	})
	.then(serial => {
		knex('users')
		// .returning(['id', 'name', 'email', 'cnt'])
		.insert({
			name: name,
			email: email
		})
		.then(id => {
			knex('users')
			.where({
				id: id
			})
			.select('*')
			.then(response => {
				res.json(response[0]);
			})
			.catch(err => res.json('Error fetching data'))
		})
		.catch(err => res.json('Error registering user'))
	})
	.catch(err => res.json('Error registering user'))
	// .then(response => {
	// 	res.json(response);
	// })
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

app.listen({process.env.PORT || 3000});



/*
 * / -> 
 * sign -> signed/not
 * register -> post user
*/
