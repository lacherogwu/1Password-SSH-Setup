# 1Password SSH Setup

## How to use?

1. Download the executeable file from the release section
2. Go to 1Password and download your `private_key`, the file will be save automatically to your `~/Downloads` directory
3. run the executable
4. fill the name and the host (i.e. 212.131.20.68)

Done!

The file will be moved to `~/.ssh/{NAME}` and it will append mapping to your `~/.ssh/config` file

## Recommendations

- Set the executeable in the `/bin` directory to you can run it straight from your terminal typing `1p-ssh-setup` in your terminal
