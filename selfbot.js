const { Client } = require('discord.js-selfbot-v13');
const readline = require('readline-sync');

// ========= CONFIG =========
const token = '-replace me-'; //discord token, log in to discord on web and use ethone token helper extension
const guildId = 'GUILDID'; // right click the server u want and do copy id
const dontTouchTheseUsers = ['UserId']; // you can add more here, for example ['userid', 'userid2']
const timeoutDurationMs = 7 * 24 * 60 * 60 * 1000; // 7 days (max timeout)
const messageDone = 'Change Me' // message ur acc will send when the thing u did is done
// ==========================

const client = new Client();

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);

    const guild = await client.guilds.fetch(guildId);
    await guild.members.fetch();

    const membersToActOn = guild.members.cache.filter(member =>
        member.id !== client.user.id &&
        !dontTouchTheseUsers.includes(member.id) &&
        !member.user.bot
    );

    console.log(`\nServer: ${guild.name}`);
    console.log(`Total eligible members: ${membersToActOn.size}`);
    console.log('\nChoose an action:\n');
    console.log('1) Ban Users');
    console.log('2) Timeout Users (1 week)');
    console.log('3) Kick Users\n');

    const choice = readline.question('Enter option number (1/2/3): ');

    switch (choice.trim()) {
        case '1':
            await banUsers(membersToActOn);
            break;
        case '2':
            await timeoutUsers(membersToActOn);
            break;
        case '3':
            await kickUsers(membersToActOn);
            break;
        default:
            console.log('Invalid option.');
            process.exit(1);
    }

    // message stuff
    try {
        const general = guild.channels.cache.find(c =>
            c.name.includes('general') && c.isText()
        ) || guild.systemChannel;

        if (general) {
            const dontTouchTheseUsersping = dontTouchTheseUsers.map(id => `<@${id}>`).join(' ');
            await general.send(messageDone);
            console.log('message sent!');
        } else {
            console.log('could not find general or system channel to send message.');
        }
    } catch (err) {
        console.error('Failed to send message:', err.message);
    }

    process.exit(0);
});

async function banUsers(members) {
    console.log('\n Banning users...');
    for (const [id, member] of members) {
        try {
            await member.ban({ reason: 'Banned LOOL' });
            console.log(`Banned ${member.user.tag}`);
        } catch (err) {
            console.log(`Could not ban ${member.user.tag}: ${err.message}`);
        }
    }
}

async function timeoutUsers(members) {
    console.log('\n Timing out users...');
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
    console.log('\n Kicking users...');
    for (const [id, member] of members) {
        try {
            await member.kick('KICKED LOOOL');
            console.log(`Kicked ${member.user.tag}`);
        } catch (err) {
            console.log(`Could not kick ${member.user.tag}: ${err.message}`);
        }
    }
}

client.login(token);
