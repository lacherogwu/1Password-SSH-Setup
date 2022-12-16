import Ask from 'https://deno.land/x/ask@1.0.6/mod.ts';

const HOME_DIR = Deno.env.get('HOME');
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
	const privateKeyPath = await getPrivateKeyPath();
	await Deno.rename(privateKeyPath, `${SSH_DIR}/${fileName}.pem`);
}

async function addToSSHConfig(host: string, fileName: string) {
	const fileSuffix = Date.now();
	await Deno.copyFile(`${SSH_DIR}/config`, `${SSH_DIR}/config-${fileSuffix}`);
	const file = await Deno.open(`${SSH_DIR}/config-${fileSuffix}`, { append: true });
	const encoder = new TextEncoder();
	const data = encoder.encode(`\n\nHost ${host} # ${fileName}\n  IdentityFile ~/.ssh/${fileName}.pem\n  IdentitiesOnly yes`);
	await file.write(data);
	file.close();
	await Deno.copyFile(`${SSH_DIR}/config-${fileSuffix}`, `${SSH_DIR}/config`);
	await Deno.remove(`${SSH_DIR}/config-${fileSuffix}`);
}

async function getPrivateKeyPath() {
	const nameList = ['id_rsa', 'id_ed25519'];
	let output;
	for (const name of nameList) {
		const path = `${HOME_DIR}/Downloads/${name}`;
		const exists = await Deno.stat(path).catch(() => false);
		if (!exists) continue;
		output = path;
	}
	if (!output) throw new Error('No private key found');

	return output;
}
