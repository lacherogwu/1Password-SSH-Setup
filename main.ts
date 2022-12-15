import Ask from 'https://deno.land/x/ask@1.0.6/mod.ts';

const HOME_DIR = Deno.env.get('HOME');
const PRIVATE_KEY_PATH = `${HOME_DIR}/Downloads/id_rsa`;
const SSH_DIR = `${HOME_DIR}/.ssh`;

const ask = new Ask();

type Input = {
	name: string;
	host: string;
};

const { name, host } = (await ask.prompt([
	{
		name: 'name',
		type: 'input',
		message: 'Name:',
	},
	{
		name: 'host',
		type: 'input',
		message: 'Host:',
	},
])) as Input;

await movePrivateKey(name);
addToSSHConfig(host, name);

async function movePrivateKey(fileName: string) {
	await verifyPrivateKeyExists();
	await Deno.rename(PRIVATE_KEY_PATH, `${SSH_DIR}/${fileName}.pem`);
}

async function addToSSHConfig(host: string, fileName: string) {
	const file = await Deno.open(`${SSH_DIR}/config`, { append: true, mode: 0o777 });
	const encoder = new TextEncoder();
	const data = encoder.encode(`\n\nHost ${host}\n  IdentityFile ~/.ssh/${fileName}.pem\n  IdentitiesOnly yes`);
	await file.write(data);
	file.close();
}

function verifyPrivateKeyExists() {
	return Deno.stat(PRIVATE_KEY_PATH);
}
