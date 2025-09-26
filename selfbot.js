const { Client } = require('discord.js-selfbot-v13');
const readline = require('readline-sync');

console.clear();
console.log('===============================');
console.log('✨ Welcome to Mysty\'s Selfbot Tool ✨'); 
console.log('===============================\n');

// ⚠️⚠️⚠️⚠️⚠️⚠️THIS IS FOR EDUCATIONAL PURPOSES ONLY⚠️⚠️⚠️⚠️⚠️⚠️

const guildId = readline.question('1) What guild ID?\n> ');

console.log('\n2) Would you like to:\n1 = Kick users\n2 = Ban users\n3 = Timeout users');
const actionChoice = readline.question('> ');

let banReason = 'Banned by Mysty\'s Selfbot';
if (actionChoice === '2') {
    banReason = readline.question('\n3) What should the ban reason be?\n> ');
}

console.log('\n4) Should there be any users not to touch?\n1 = Yes\n2 = No');
const skipChoice = readline.question('> ');

let dontTouchTheseUsers = [];
if (skipChoice === '1') {
    const userCount = parseInt(readline.question('\n4.5) How many users not to touch? (max 10)\n> '));
    for (let i = 0; i < Math.min(userCount, 10); i++) {
        const userId = readline.question(`4.UserData${i + 1}) Enter User ID ${i + 1}\n> `);
        dontTouchTheseUsers.push(userId.trim());
    }
}

console.log('\n5) Do you want to send a message in every channel when done?\n1 = Yes\n2 = No');
const sendMessageChoice = readline.question('> ');

let messageDone = '';
if (sendMessageChoice === '1') {
    messageDone = readline.question('\n6) What message to send?\n> ');
}

const token = readline.question('\n Paste your Discord user token (input hidden):\n> ', { hideEchoBack: true });
const timeoutDurationMs = 7 * 24 * 60 * 60 * 1000;

const client = new Client();

client.on('ready', async () => {
    console.log(`\n Logged in as ${client.user.tag}`);

    const guild = await client.guilds.fetch(guildId).catch(err => {
        console.error(` Failed to fetch guild: ${err.message}`);
        process.exit(1);
    });

    await guild.members.fetch();

    const membersToActOn = guild.members.cache.filter(member =>
        member.id !== client.user.id &&
        !dontTouchTheseUsers.includes(member.id) &&
        !member.user.bot
    );

    console.log(`\n Server: ${guild.name}`);
    console.log(` Total affected members: ${membersToActOn.size}\n`);

    switch (actionChoice) {
        case '1':
            console.log('Thanks for using Mysty\'s Selfbot Tool, sending kicks...\n');
            await kickUsers(membersToActOn);
            console.log('\n Done sending kicks.');
            break;
        case '2':
            console.log('Thanks for using Mysty\'s Selfbot Tool, sending bans...\n');
            await banUsers(membersToActOn, banReason);
            console.log('\n Done sending bans.');
            break;
        case '3':
            console.log('Thanks for using Mysty\'s Selfbot Tool, sending timeouts...\n');
            await timeoutUsers(membersToActOn);
            console.log('\n Done sending timeouts.');
            break;
        default:
            console.log(' Invalid action. Exiting.');
            process.exit(1);
    }

    if (sendMessageChoice === '1' && messageDone) {
        for (const [id, channel] of guild.channels.cache) {
            if (channel.isText() && channel.viewable && channel.permissionsFor(guild.me ?? client.user)?.has('SEND_MESSAGES')) {
                try {
                    await channel.send(messageDone);
                    console.log(` Sent message in #${channel.name}`);
                } catch (err) {
                    console.log(` Could not send in #${channel.name}: ${err.message}`);
                }
            }
        }
    }

    console.log('\n Finished.');
    process.exit(0);
});

async function banUsers(members, reason) {
    for (const [id, member] of members) {
        try {
            await member.ban({ reason });
            console.log(`Banned ${member.user.tag}`);
        } catch (err) {
            console.log(` Could not ban ${member.user.tag}: ${err.message}`);
        }
    }
}

async function timeoutUsers(members) {
    for (const [id, member] of members) {
        try {
            await member.disableCommunicationUntil(Date.now() + timeoutDurationMs);
            console.log(` Timed out ${member.user.tag}`);
        } catch (err) {
            console.log(` Could not timeout ${member.user.tag}: ${err.message}`);
        }
    }
}

async function kickUsers(members) {
    for (const [id, member] of members) {
        try {
            await member.kick('Kicked by Mysty\'s Selfbot');
            console.log(` Kicked ${member.user.tag}`);
        } catch (err) {
            console.log(` Could not kick ${member.user.tag}: ${err.message}`);
        }
    }
}

client.login(token);
