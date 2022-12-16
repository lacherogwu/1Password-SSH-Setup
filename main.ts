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
	const fileSuffix = Date.now();
	await Deno.copyFile(`${SSH_DIR}/config`, `${SSH_DIR}/config-${fileSuffix}`);
	const file = await Deno.open(`${SSH_DIR}/config-${fileSuffix}`, { append: true });
	const encoder = new TextEncoder();
	const data = encoder.encode(`\n\nHost ${host}\n  IdentityFile ~/.ssh/${fileName}.pem\n  IdentitiesOnly yes`);
	await file.write(data);
	file.close();
	await Deno.copyFile(`${SSH_DIR}/config-${fileSuffix}`, `${SSH_DIR}/config`);
	await Deno.remove(`${SSH_DIR}/config-${fileSuffix}`);
}

function verifyPrivateKeyExists() {
	return Deno.stat(PRIVATE_KEY_PATH);
}
