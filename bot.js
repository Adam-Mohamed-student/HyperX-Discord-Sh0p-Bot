const { 
    Client, 
    GatewayIntentBits, 
    PermissionsBitField, 
    SlashCommandBuilder, 
    REST, 
    Routes, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    StringSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');
const { token, clientId, guildId, email } = require('./config.json');
const fs = require('fs');
const schedule = require('node-schedule');
const nodemailer = require('nodemailer');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildModeration
    ] 
});

const SLOTS_FILE = './slots.json';
const STICKY_FILE = './sticky.json';
const ECONOMY_FILE = './economy.json';
const SLOT_LOGS_FILE = './slotLogs.json';
const PAYPAL_FILE = './paypal.json';
const CRYPTO_FILE = './crypto.json';
const WARNINGS_FILE = './warnings.json';
const RECEIPTS_FILE = './receipts.json';
let slots = [];
let stickyMessages = {};
let economy = {};
let slotLogs = [];
let paypalData = {};
let cryptoData = {};
let warnings = {};
let receipts = {};
const PREFIX = '=';

// Category IDs
const CATEGORIES = {
 CATEGORY_1: 'YOUR_CATEGORY_ID_1',
 CATEGORY_2: 'YOUR_CATEGORY_ID_2'
};

const LOG_CHANNEL_ID = 'YOUR_LOG_CHANNEL_ID';
const TRANSCRIPT_CHANNEL_ID = 'YOUR_TRANSCRIPT_CHANNEL_ID';

// Allowed role IDs for new commands
const ALLOWED_ROLES = [
 'ROLE_ID_1',
 'ROLE_ID_2',
 'ROLE_ID_3',
 'ROLE_ID_4'
];

// Email transporter setup
const emailTransporter = nodemailer.createTransport({
    service: email.service,
    auth: {
        user: email.user,
        pass: email.pass
    }
});

// Load, save functions for all data
function loadSlots() {
    if (fs.existsSync(SLOTS_FILE)) {
        try {
            const data = fs.readFileSync(SLOTS_FILE, 'utf8');
            slots = JSON.parse(data);
            console.log('Slots loaded from file:', slots.length, 'slots');
        } catch (error) {
            console.error('Error reading slots file:', error);
        }
    }
}

function saveSlots() {
    try {
        fs.writeFileSync(SLOTS_FILE, JSON.stringify(slots, null, 2));
        console.log('Slots saved to file.');
    } catch (error) {
        console.error('Error writing to slots file:', error);
    }
}

function loadSticky() {
    if (fs.existsSync(STICKY_FILE)) {
        try {
            const data = fs.readFileSync(STICKY_FILE, 'utf8');
            stickyMessages = JSON.parse(data);
            console.log('Sticky messages loaded:', Object.keys(stickyMessages).length, 'channels');
        } catch (error) {
            console.error('Error reading sticky file:', error);
        }
    }
}

function saveSticky() {
    try {
        fs.writeFileSync(STICKY_FILE, JSON.stringify(stickyMessages, null, 2));
        console.log('Sticky messages saved.');
    } catch (error) {
        console.error('Error writing to sticky file:', error);
    }
}

function loadEconomy() {
    if (fs.existsSync(ECONOMY_FILE)) {
        try {
            const data = fs.readFileSync(ECONOMY_FILE, 'utf8');
            economy = JSON.parse(data);
            console.log('Economy data loaded');
        } catch (error) {
            console.error('Error reading economy file:', error);
        }
    } else {
        economy = {};
        saveEconomy();
    }
}

function saveEconomy() {
    try {
        fs.writeFileSync(ECONOMY_FILE, JSON.stringify(economy, null, 2));
        console.log('Economy data saved');
    } catch (error) {
        console.error('Error writing to economy file:', error);
    }
}

function loadSlotLogs() {
    if (fs.existsSync(SLOT_LOGS_FILE)) {
        try {
            const data = fs.readFileSync(SLOT_LOGS_FILE, 'utf8');
            slotLogs = JSON.parse(data);
            console.log('Slot logs loaded:', slotLogs.length, 'logs');
        } catch (error) {
            console.error('Error reading slot logs file:', error);
        }
    }
}

function saveSlotLogs() {
    try {
        fs.writeFileSync(SLOT_LOGS_FILE, JSON.stringify(slotLogs, null, 2));
        console.log('Slot logs saved.');
    } catch (error) {
        console.error('Error writing to slot logs file:', error);
    }
}

function loadPayPal() {
    if (fs.existsSync(PAYPAL_FILE)) {
        try {
            const data = fs.readFileSync(PAYPAL_FILE, 'utf8');
            paypalData = JSON.parse(data);
            console.log('PayPal data loaded');
        } catch (error) {
            console.error('Error reading PayPal file:', error);
        }
    } else {
        paypalData = {};
        savePayPal();
    }
}

function savePayPal() {
    try {
        fs.writeFileSync(PAYPAL_FILE, JSON.stringify(paypalData, null, 2));
        console.log('PayPal data saved');
    } catch (error) {
        console.error('Error writing to PayPal file:', error);
    }
}

function loadCrypto() {
    if (fs.existsSync(CRYPTO_FILE)) {
        try {
            const data = fs.readFileSync(CRYPTO_FILE, 'utf8');
            cryptoData = JSON.parse(data);
            console.log('Crypto data loaded');
        } catch (error) {
            console.error('Error reading crypto file:', error);
        }
    } else {
        cryptoData = {};
        saveCrypto();
    }
}

function saveCrypto() {
    try {
        fs.writeFileSync(CRYPTO_FILE, JSON.stringify(cryptoData, null, 2));
        console.log('Crypto data saved');
    } catch (error) {
        console.error('Error writing to crypto file:', error);
    }
}

function loadWarnings() {
    if (fs.existsSync(WARNINGS_FILE)) {
        try {
            const data = fs.readFileSync(WARNINGS_FILE, 'utf8');
            warnings = JSON.parse(data);
            console.log('Warnings data loaded');
        } catch (error) {
            console.error('Error reading warnings file:', error);
        }
    } else {
        warnings = {};
        saveWarnings();
    }
}

function saveWarnings() {
    try {
        fs.writeFileSync(WARNINGS_FILE, JSON.stringify(warnings, null, 2));
        console.log('Warnings data saved');
    } catch (error) {
        console.error('Error writing to warnings file:', error);
    }
}

function loadReceipts() {
    if (fs.existsSync(RECEIPTS_FILE)) {
        try {
            const data = fs.readFileSync(RECEIPTS_FILE, 'utf8');
            receipts = JSON.parse(data);
            console.log('Receipts loaded');
        } catch (error) {
            console.error('Error reading receipts file:', error);
        }
    } else {
        receipts = {};
        saveReceipts();
    }
}

function saveReceipts() {
    try {
        fs.writeFileSync(RECEIPTS_FILE, JSON.stringify(receipts, null, 2));
        console.log('Receipts saved');
    } catch (error) {
        console.error('Error writing to receipts file:', error);
    }
}

function addSlotLog(action, details, slotData) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        action,
        details,
        slotData: {
            userId: slotData.userId,
            channelId: slotData.channelId,
            slotName: slotData.slotName || `slot-${slotData.userId}`,
            duration: slotData.duration,
            pingConfig: slotData.pingConfig,
            createdBy: slotData.createdBy,
            category: slotData.category
        }
    };
    
    slotLogs.push(logEntry);
    if (slotLogs.length > 1000) {
        slotLogs = slotLogs.slice(-1000);
    }
    saveSlotLogs();
    
    console.log(`Slot Log [${action}]:`, details);
}

// Check if user has allowed role
function hasAllowedRole(member) {
    return ALLOWED_ROLES.some(roleId => member.roles.cache.has(roleId));
}

// Check if user has moderation permissions
function hasModPermission(member) {
    return member.permissions.has(PermissionsBitField.Flags.KickMembers) || 
           member.permissions.has(PermissionsBitField.Flags.BanMembers) ||
           member.permissions.has(PermissionsBitField.Flags.ModerateMembers) ||
           member.permissions.has(PermissionsBitField.Flags.ManageMessages);
}

// Economy functions
function getBalance(userId) {
    return economy[userId]?.balance || 1000;
}

function updateBalance(userId, amount) {
    if (!economy[userId]) {
        economy[userId] = { balance: 1000 };
    }
    economy[userId].balance += amount;
    saveEconomy();
    return economy[userId].balance;
}

// Format duration for display
function formatDuration(ms) {
    if (ms === Infinity) return 'Lifetime';
    
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
        return `${days} day${days !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
}

// Format date for display
function formatDate(date) {
    return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });
}

// Parse time string to milliseconds
function parseTime(timeString) {
    const timeRegex = /^(\d+)([smhd])$/;
    const match = timeString.match(timeRegex);
    
    if (!match) return null;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        default: return null;
    }
}

// Add warning to user
function addWarning(userId, moderatorId, reason) {
    if (!warnings[userId]) {
        warnings[userId] = [];
    }
    
    const warning = {
        id: Date.now().toString(),
        moderatorId,
        reason: reason || 'No reason provided',
        timestamp: Date.now(),
        date: new Date().toISOString()
    };
    
    warnings[userId].push(warning);
    saveWarnings();
    
    return warning;
}

// Get user warnings
function getUserWarnings(userId) {
    return warnings[userId] || [];
}

// Clear user warnings
function clearWarnings(userId) {
    if (warnings[userId]) {
        delete warnings[userId];
        saveWarnings();
        return true;
    }
    return false;
}

// Remove specific warning
function removeWarning(userId, warningId) {
    if (warnings[userId]) {
        const initialLength = warnings[userId].length;
        warnings[userId] = warnings[userId].filter(w => w.id !== warningId);
        
        if (warnings[userId].length === 0) {
            delete warnings[userId];
        }
        
        saveWarnings();
        return initialLength !== warnings[userId]?.length;
    }
    return false;
}

// Create moderation log embed
function createModLogEmbed(action, target, moderator, reason, duration = null) {
    const embed = new EmbedBuilder()
        .setColor(getModActionColor(action))
        .setTitle(`🔨 ${action.charAt(0).toUpperCase() + action.slice(1)}`)
        .addFields(
            { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
            { name: 'Moderator', value: `${moderator.tag}`, inline: true },
            { name: 'Reason', value: reason || 'No reason provided', inline: false }
        )
        .setTimestamp();
    
    if (duration) {
        embed.addFields({ name: 'Duration', value: formatDuration(duration), inline: true });
    }
    
    return embed;
}

// Get color for moderation action
function getModActionColor(action) {
    switch (action.toLowerCase()) {
        case 'ban': return 0xFF0000;
        case 'kick': return 0xFFA500;
        case 'mute': return 0xFFFF00;
        case 'warn': return 0xFEE75C;
        case 'unban': return 0x57F287;
        case 'unmute': return 0x57F287;
        default: return 0x0099FF;
    }
}

// Send moderation log
async function sendModLog(embed) {
    try {
        const logChannel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
        if (logChannel) {
            await logChannel.send({ embeds: [embed] });
        }
    } catch (error) {
        console.error('Error sending mod log:', error);
    }
}

// RECEIPT SYSTEM FUNCTIONS
function createReceiptMessage(product, price, seller) {
    const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('📧 You Have a New Receipt')
        .setDescription(`You have a new receipt from **${seller}** for the purchase of **${product}**.`)
        .addFields(
            { name: 'For additional security', value: 'Receipt will be sent to your email.', inline: false },
            { name: 'Important', value: '**Save this receipt in case of issues with the product, without it we won\'t be able to proceed**', inline: false }
        )
        .addFields(
            { name: 'Product', value: product, inline: true },
            { name: 'Price', value: price, inline: true }
        )
        .setFooter({ text: 'Dragonsky 2025 @ All Rights Reserved.' })
        .setTimestamp();

    const emailButton = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('enter_email_receipt')
                .setLabel('Click to Enter Email for Receipt')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📧')
        );

    return { embeds: [embed], components: [emailButton] };
}

function createEmailModal() {
    return new ModalBuilder()
        .setCustomId('email_receipt_modal')
        .setTitle('Enter Your Email Address')
        .addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('email_input')
                    .setLabel('Email Address')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder('your-email@example.com')
                    .setRequired(true)
                    .setMaxLength(100)
            )
        );
}

async function sendReceiptEmail(customerEmail, product, price, paymentMethod, seller, buyerId, transactionId) {
    const mailOptions = {
        from: email.user,
        to: customerEmail,
        subject: `Your Receipt for ${product}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; color: white; text-align: center;">
                    <h1>Dragonsky Receipt</h1>
                    <p>Transaction ID: ${transactionId}</p>
                </div>
                
                <div style="padding: 20px; background: #f9f9f9;">
                    <h2 style="color: #333;">Receipt of Purchase</h2>
                    <p>Thank you for your purchase, <strong>${buyerId}</strong>!</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <h3 style="color: #667eea;">Transaction Details:</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Product:</strong></td>
                                <td style="padding: 8px; border-bottom: 1px solid #eee;">${product}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Price:</strong></td>
                                <td style="padding: 8px; border-bottom: 1px solid #eee;">${price}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Payment Method:</strong></td>
                                <td style="padding: 8px; border-bottom: 1px solid #eee;">${paymentMethod}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Sold by:</strong></td>
                                <td style="padding: 8px; border-bottom: 1px solid #eee;">${seller}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Buyer User ID:</strong></td>
                                <td style="padding: 8px; border-bottom: 1px solid #eee;">${buyerId}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Date Sent:</strong></td>
                                <td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date().toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px;"><strong>Transaction ID:</strong></td>
                                <td style="padding: 8px;">${transactionId}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <p style="color: #666; font-size: 12px; text-align: center;">
                        Make by unknown • Dragonsky 2025 @ All Rights Reserved.
                    </p>
                </div>
            </div>
        `
    };

    try {
        await emailTransporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

function generateTransactionId() {
    return Math.random().toString(36).substring(2, 10) + Date.now().toString(36).substring(4);
}

// TRANSCRIPT SYSTEM FUNCTIONS - UPDATED FOR TICKET TOOL
async function handleViewTranscript(interactionOrMessage, ticketIdentifier) {
    const channel = await getTranscriptChannel();
    if (!channel) {
        return sendReply(interactionOrMessage, '❌ Transcript channel not found.', true);
    }

    // Extract ticket ID from channel mention or use as-is
    let ticketId = ticketIdentifier;
    const channelMatch = ticketIdentifier.match(/<#(\d+)>/);
    if (channelMatch) {
        ticketId = channelMatch[1];
    }

    // Search for transcript message
    const transcriptMessage = await findTranscriptMessage(channel, ticketId);
    if (!transcriptMessage) {
        return sendReply(interactionOrMessage, '❌ Transcript not found for this ticket.', true);
    }

    // Extract HTML content and create viewable link
    const viewUrl = await createTranscriptView(transcriptMessage, ticketId);
    if (!viewUrl) {
        return sendReply(interactionOrMessage, '❌ Could not create transcript view.', true);
    }

    const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('📄 Transcript Viewer')
        .setDescription(`Click the button below to view the transcript for ticket ${ticketId}`)
        .addFields(
            { name: 'Ticket ID', value: ticketId, inline: true },
            { name: 'Transcript Date', value: `<t:${Math.floor(transcriptMessage.createdTimestamp / 1000)}:R>`, inline: true }
        )
        .setFooter({ text: 'Transcript Viewer • One-click access' })
        .setTimestamp();

    const viewButton = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel('View Transcript')
                .setURL(viewUrl)
                .setStyle(ButtonStyle.Link)
                .setEmoji('📄')
        );

    return sendReply(interactionOrMessage, { 
        embeds: [embed], 
        components: [viewButton] 
    });
}

// UPDATED PULL COMMAND FOR TICKET TOOL INTEGRATION
async function handlePullCommand(interactionOrMessage, ticketIdentifier) {
    try {
        const transcriptChannel = await getTranscriptChannel();
        if (!transcriptChannel) {
            return sendReply(interactionOrMessage, '❌ Transcript channel not found. Please check if the transcript channel ID is correct.', true);
        }

        // Extract ticket ID from channel mention or use as-is
        let ticketId = ticketIdentifier;
        const channelMatch = ticketIdentifier.match(/<#(\d+)>/);
        if (channelMatch) {
            ticketId = channelMatch[1];
        }

        console.log(`Searching for transcript with ID: ${ticketId}`);

        // Search for transcript message
        const transcriptMessage = await findTranscriptMessage(transcriptChannel, ticketId);
        if (!transcriptMessage) {
            return sendReply(interactionOrMessage, 
                `❌ No transcript found for "${ticketIdentifier}".\n\n**Tips:**\n• Use the channel mention: \`=pull #closed-ticket\`\n• Or use the ticket ID: \`=pull TICKET-123\`\n• Make sure the ticket has been closed and transcript created by Ticket Tool`, 
                true
            );
        }

        // Create a nice embed with transcript information
        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('📄 Transcript Found')
            .setDescription(`Transcript for: **${ticketIdentifier}**`)
            .addFields(
                { name: '🆔 Found In', value: `[Transcript Message](${transcriptMessage.url})`, inline: true },
                { name: '📅 Created', value: `<t:${Math.floor(transcriptMessage.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '👤 By', value: `<@${transcriptMessage.author.id}>`, inline: true }
            );

        // Create action buttons
        const actionRow = new ActionRowBuilder();

        // Check for HTML attachment (Ticket Tool usually creates these)
        const htmlAttachment = transcriptMessage.attachments.find(att => 
            att.name && (att.name.endsWith('.html') || att.name.includes('transcript'))
        );

        if (htmlAttachment) {
            actionRow.addComponents(
                new ButtonBuilder()
                    .setLabel('View HTML Transcript')
                    .setURL(htmlAttachment.url)
                    .setStyle(ButtonStyle.Link)
                    .setEmoji('📄')
            );
        }

        // Check for text transcript or message content
        const textAttachment = transcriptMessage.attachments.find(att => 
            att.name && (att.name.endsWith('.txt') || att.name.includes('transcript'))
        );

        if (textAttachment) {
            actionRow.addComponents(
                new ButtonBuilder()
                    .setLabel('View Text Transcript')
                    .setURL(textAttachment.url)
                    .setStyle(ButtonStyle.Link)
                    .setEmoji('📝')
            );
        }

        // If no attachments, try to use message content or embeds
        if (transcriptMessage.content && transcriptMessage.content.length > 0) {
            embed.addFields({ 
                name: '📋 Transcript Preview', 
                value: transcriptMessage.content.length > 1000 
                    ? transcriptMessage.content.substring(0, 1000) + '...' 
                    : transcriptMessage.content 
            });
        }

        // Add Discord message link as fallback
        if (actionRow.components.length === 0) {
            actionRow.addComponents(
                new ButtonBuilder()
                    .setLabel('View Transcript Message')
                    .setURL(transcriptMessage.url)
                    .setStyle(ButtonStyle.Link)
                    .setEmoji('🔗')
            );
        }

        const response = { embeds: [embed] };
        if (actionRow.components.length > 0) {
            response.components = [actionRow];
        }

        return sendReply(interactionOrMessage, response);

    } catch (error) {
        console.error('Error in pull command:', error);
        return sendReply(interactionOrMessage, '❌ An error occurred while searching for the transcript.', true);
    }
}

// SIMPLE PULL COMMAND FOR CURRENT CHANNEL
async function handleQuickPull(interactionOrMessage) {
    const channel = interactionOrMessage.channel;
    
    const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🔍 Quick Trade Info')
        .setDescription('Scanning current channel for trade information...')
        .addFields(
            { name: 'Usage Tip', value: 'To get transcripts from closed tickets, use: `=pull #closed-ticket-channel`' },
            { name: 'Example', value: '`=pull #ticket-123` or `=pull #closed-username-123`' }
        );

    return sendReply(interactionOrMessage, { embeds: [embed] });
}

// IMPROVED TRANSCRIPT SEARCH FUNCTION FOR TICKET TOOL
async function findTranscriptMessage(channel, ticketId) {
    try {
        console.log(`Searching in channel: ${channel.name} for ticket: ${ticketId}`);

        // Search recent messages first (most transcripts will be recent)
        const messages = await channel.messages.fetch({ limit: 100 });
        
        for (const [_, message] of messages) {
            // Method 1: Check if message contains the ticket ID in content
            if (message.content && message.content.includes(ticketId)) {
                console.log(`Found transcript by content match: ${message.id}`);
                return message;
            }
            
            // Method 2: Check attachments for ticket ID in filename
            if (message.attachments.size > 0) {
                const matchingAttachment = message.attachments.find(att => 
                    att.name && att.name.includes(ticketId)
                );
                if (matchingAttachment) {
                    console.log(`Found transcript by attachment match: ${message.id}`);
                    return message;
                }
            }
            
            // Method 3: Check embeds for ticket ID
            if (message.embeds.length > 0) {
                const matchingEmbed = message.embeds.find(embed => 
                    (embed.title && embed.title.includes(ticketId)) ||
                    (embed.description && embed.description.includes(ticketId)) ||
                    (embed.fields && embed.fields.some(field => 
                        field.value && field.value.includes(ticketId)
                    ))
                );
                if (matchingEmbed) {
                    console.log(`Found transcript by embed match: ${message.id}`);
                    return message;
                }
            }
            
            // Method 4: Check for any transcript-like content
            if (message.content && (
                message.content.toLowerCase().includes('transcript') ||
                message.content.toLowerCase().includes('ticket') ||
                message.content.toLowerCase().includes('closed')
            )) {
                // Check if this might be our ticket by looking for similar patterns
                const channelMention = `<#${ticketId}>`;
                if (message.content.includes(channelMention)) {
                    console.log(`Found transcript by channel mention: ${message.id}`);
                    return message;
                }
            }
        }
        
        // If not found in recent messages, search more broadly
        console.log('Not found in recent messages, searching more...');
        let lastMessageId = messages.last()?.id;
        let searchCount = 0;
        
        while (searchCount < 5) { // Search up to 500 messages total
            const moreMessages = await channel.messages.fetch({ 
                limit: 100, 
                before: lastMessageId 
            });
            
            if (moreMessages.size === 0) break;
            
            for (const [_, message] of moreMessages) {
                if (message.content && message.content.includes(ticketId)) {
                    console.log(`Found transcript in older messages: ${message.id}`);
                    return message;
                }
                
                if (message.attachments.size > 0) {
                    const matchingAttachment = message.attachments.find(att => 
                        att.name && att.name.includes(ticketId)
                    );
                    if (matchingAttachment) return message;
                }
            }
            
            lastMessageId = moreMessages.last()?.id;
            searchCount++;
        }
        
        console.log('Transcript not found after extensive search');
        return null;
        
    } catch (error) {
        console.error('Error searching for transcript message:', error);
        return null;
    }
}

// Helper function to get transcript channel
async function getTranscriptChannel() {
    try {
        return await client.channels.fetch(TRANSCRIPT_CHANNEL_ID);
    } catch (error) {
        console.error('Error fetching transcript channel:', error);
        return null;
    }
}

// Function to create a viewable transcript
async function createTranscriptView(transcriptMessage, ticketId) {
    try {
        // Method 1: Check for HTML attachment
        if (transcriptMessage.attachments.size > 0) {
            const htmlAttachment = transcriptMessage.attachments.find(att => 
                att.name?.endsWith('.html')
            );
            
            if (htmlAttachment) {
                // Return direct Discord attachment URL (viewable in browser)
                return htmlAttachment.url;
            }
        }
        
        // Method 2: Check if message contains a link
        const urlRegex = /https?:\/\/[^\s]+/g;
        const urls = transcriptMessage.content.match(urlRegex);
        if (urls && urls.length > 0) {
            // Return the first URL found
            return urls[0];
        }
        
        // Method 3: Check embeds for URLs
        if (transcriptMessage.embeds.length > 0) {
            for (const embed of transcriptMessage.embeds) {
                if (embed.url) return embed.url;
                if (embed.description) {
                    const embedUrls = embed.description.match(urlRegex);
                    if (embedUrls && embedUrls.length > 0) {
                        return embedUrls[0];
                    }
                }
            }
        }
        
        // Method 4: Return the discord message link as fallback
        return `https://discord.com/channels/${transcriptMessage.guildId}/${TRANSCRIPT_CHANNEL_ID}/${transcriptMessage.id}`;
        
    } catch (error) {
        console.error('Error creating transcript view:', error);
        return null;
    }
}

// Helper function to send replies (works for both interactions and messages)
async function sendReply(interactionOrMessage, content, ephemeral = false) {
    if (interactionOrMessage.reply) {
        // It's an interaction
        if (typeof content === 'string') {
            return await interactionOrMessage.reply({ 
                content, 
                ephemeral 
            });
        } else {
            return await interactionOrMessage.reply({ 
                ...content, 
                ephemeral 
            });
        }
    } else {
        // It's a message
        if (typeof content === 'string') {
            return await interactionOrMessage.channel.send(content);
        } else {
            return await interactionOrMessage.channel.send(content);
        }
    }
}

// Create slot function
async function createSlot(interaction, user, duration, pingConfigInput, slotName, categoryId) {
    const guild = interaction.guild;
    const channelName = slotName ? slotName.toLowerCase().replace(/\s+/g, '-') : `slot-${user.username}`;
    const expirationTime = duration === Infinity ? Infinity : Date.now() + duration;

    // Parse ping config
    const pingConfig = {};
    const pingCounts = {};
    const allowedMentions = {
        '@here': false,
        '@everyone': false
    };
    
    pingConfigInput.split(',').forEach(part => {
        const [limit, type] = part.trim().split(' ');
        const pingType = type.toLowerCase();
        pingConfig[pingType] = parseInt(limit, 10);
        pingCounts[pingType] = 0;
        allowedMentions[pingType] = pingConfig[pingType] > 0;
    });

    const channel = await guild.channels.create({
        name: channelName,
        type: 0,
        parent: categoryId,
        permissionOverwrites: [
            {
                id: guild.roles.everyone.id,
                deny: [PermissionsBitField.Flags.ViewChannel],
            },
            {
                id: user.id,
                allow: [
                    PermissionsBitField.Flags.ViewChannel,
                    PermissionsBitField.Flags.SendMessages,
                    PermissionsBitField.Flags.ReadMessageHistory,
                    PermissionsBitField.Flags.MentionEveryone,
                ],
            },
            {
                id: client.user.id,
                allow: [
                    PermissionsBitField.Flags.ViewChannel,
                    PermissionsBitField.Flags.SendMessages,
                    PermissionsBitField.Flags.ManageChannels,
                    PermissionsBitField.Flags.ManageMessages,
                ],
            },
        ],
    });

    const slot = {
        userId: user.id,
        channelId: channel.id,
        expirationTime,
        pingConfig,
        pingCounts,
        slotName: slotName || `Slot ${user.username}`,
        duration: duration,
        createdBy: interaction.user.id,
        createdAt: Date.now(),
        allowedMentions,
        category: categoryId === CATEGORIES.CATEGORY_1 ? 'Category 1' : 'Category 2'
    };
    slots.push(slot);
    saveSlots();
    
    if (expirationTime !== Infinity) {
        scheduleExpiration(slot);
    }

    // Create the slot created embed
    const purchaseDate = new Date();
    const expiryDate = expirationTime === Infinity ? 'Never' : new Date(expirationTime);
    
    const slotCreatedEmbed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('# Slot Created')
        .addFields(
            { name: 'Slot Owner', value: `<@${user.id}>`, inline: true },
            { name: 'Date of Purchase', value: formatDate(purchaseDate), inline: true },
            { name: 'Duration', value: formatDuration(duration), inline: true },
            { name: 'Expiry Date', value: expirationTime === Infinity ? 'Never' : formatDate(expiryDate), inline: true },
            { name: 'Slot Name', value: slot.slotName, inline: true },
            { name: 'Created By', value: `<@${interaction.user.id}>`, inline: true }
        )
        .setTimestamp();

    // Create permissions embed
    const maxPings = Object.values(pingConfig).reduce((sum, count) => sum + count, 0);
    const permissionsEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Permissions')
        .addFields(
            { name: 'Maximum Pings', value: maxPings.toString(), inline: true },
            { name: '@here Allowed', value: allowedMentions['@here'] ? 'Yes' : 'No', inline: true },
            { name: '@everyone Allowed', value: allowedMentions['@everyone'] ? 'Yes' : 'No', inline: true }
        );

    // Create welcome embed
    const welcomeEmbed = new EmbedBuilder()
        .setColor(0xFFA500)
        .setTitle('Welcome to your Slot!')
        .setDescription('Here you can manage your slot. Use the available commands to add or remove users, renew your slot, and more.')
        .addFields(
            { name: 'Note', value: `You can use up to ${maxPings} pings.` },
            { name: 'Mentions Status', value: `${allowedMentions['@here'] ? '● @here mentions are enabled.' : '○ @here mentions are disabled.'}` }
        );

    // Send all embeds to the slot channel
    await channel.send({ content: `<@${user.id}>`, embeds: [slotCreatedEmbed, permissionsEmbed, welcomeEmbed] });

    // Create action log
    await createSlotActionLog(interaction, slot, user);

    // Add to logs
    addSlotLog('Slot-Created', `Slot created for ${user.tag} by ${interaction.user.tag}`, slot);

    return slot;
}

// Create slot action log
async function createSlotActionLog(interaction, slot, user) {
    const logChannel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
    
    if (!logChannel) {
        console.log('Log channel not found, skipping action log creation');
        return;
    }

    const logEmbed = new EmbedBuilder()
        .setColor(0xFFFF00)
        .setTitle('# Slot Action Log')
        .addFields(
            { name: 'Action', value: 'Slot-Created' },
            { name: 'Details', value: `Slot created for <@${user.id}> by <@${interaction.user.id}>` },
            { name: 'Duration', value: formatDuration(slot.duration) },
            { name: 'Category', value: slot.category === 'Category 1' ? '1' : '2', inline: true },
            { name: 'Channel Name', value: slot.slotName, inline: true },
            { name: 'Settings', value: `@here_${slot.allowedMentions['@here'] ? 'True' : 'False'}, @everyone_${slot.allowedMentions['@everyone'] ? 'True' : 'False'}, max_pings=${Object.values(slot.pingConfig).reduce((sum, count) => sum + count, 0)}` }
        )
        .setFooter({ text: 'Slot Manager and System - Next reset at midnight' })
        .setTimestamp();

    await logChannel.send({ embeds: [logEmbed] });
}

// Update slot permissions
async function updateSlotPermissions(slot, allowMentionEveryone) {
    const channel = client.channels.cache.get(slot.channelId);
    if (!channel) return;
    
    const permissions = {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
        MentionEveryone: allowMentionEveryone
    };
    
    await channel.permissionOverwrites.edit(slot.userId, permissions);
}

// Schedule expiration
function scheduleExpiration(slot) {
    if (slot.expirationTime === Infinity) return;
    
    const expirationTime = new Date(slot.expirationTime);
    schedule.scheduleJob(expirationTime, async () => {
        const channel = client.channels.cache.get(slot.channelId);
        if (channel) {
            // Send expiration warning before deleting
            const expiryEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('Slot Expired')
                .setDescription('This slot has expired and will be deleted shortly.')
                .setTimestamp();
            
            await channel.send({ embeds: [expiryEmbed] }).catch(console.error);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
            await channel.delete().catch(console.error);
        }
        slots = slots.filter(s => s !== slot);
        saveSlots();
        
        // Log expiration
        addSlotLog('Slot-Expired', `Slot expired for user ${slot.userId}`, slot);
    });
}

// Send ping usage update
async function sendPingUsageUpdate(channel, slot, pingType) {
    const remainingPings = slot.pingConfig[pingType] - slot.pingCounts[pingType];
    
    const usageEmbed = new EmbedBuilder()
        .setColor(remainingPings > 0 ? 0xFFA500 : 0xFF0000)
        .setTitle('Ping Usage Update')
        .setDescription(`You have ${remainingPings} ${pingType} pings remaining.`);
    
    await channel.send({ embeds: [usageEmbed] });
}

// Reset daily ping counts
schedule.scheduleJob('0 0 * * *', async () => {
    console.log('Resetting daily ping counts and permissions for all slots');
    for (const slot of slots) {
        for (const pingType in slot.pingCounts) {
            slot.pingCounts[pingType] = 0;
        }
        await updateSlotPermissions(slot, true);
        
        // Send reset notification to slot channel
        const channel = client.channels.cache.get(slot.channelId);
        if (channel) {
            const resetEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('Daily Ping Reset')
                .setDescription('Your daily ping limits have been reset! You now have full ping permissions.')
                .setTimestamp();
            
            await channel.send({ embeds: [resetEmbed] }).catch(console.error);
        }
    }
    saveSlots();
});

// TOS SYSTEM
function createTosEmbed() {
    const mainEmbed = new EmbedBuilder()
        .setColor(0x2F3136)
        .setTitle('DarkDragon - Terms of Service')
        .setDescription('By proceeding, you acknowledge and agree to these terms below. Click the dropdown to select each terms section.')
        .setFooter({ text: 'Select a category to view terms' })
        .setTimestamp();

    const selectMenu = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('tos_category_select')
                .setPlaceholder('Choose a category...')
                .addOptions(
                    {
                        label: 'General',
                        description: 'General terms and conditions',
                        value: 'general'
                    },
                    {
                        label: 'Products',
                        description: 'Product-specific terms and policies',
                        value: 'products'
                    }
                )
        );

    return { 
        embeds: [mainEmbed], 
        components: [selectMenu] 
    };
}

function createGeneralTermsEmbed() {
    const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('📋 General Terms & Conditions')
        .setDescription('By proceeding, you acknowledge and agree to these terms below. Click the buttons to view each terms section.')
        .setFooter({ text: 'Select a section to view detailed terms' })
        .setTimestamp();

    const buttonsRow1 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('tos_server_terms')
                .setLabel('Server Terms')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('tos_slot_terms')
                .setLabel('Slot Terms')
                .setStyle(ButtonStyle.Primary)
        );

    const buttonsRow2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('tos_service_terms')
                .setLabel('Service Terms')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('tos_marketing_terms')
                .setLabel('Marketing Terms')
                .setStyle(ButtonStyle.Primary)
        );

    return { 
        embeds: [embed], 
        components: [buttonsRow1, buttonsRow2] 
    };
}

function createProductsTermsEmbed() {
    const embed = new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle('🛍️ Products Terms & Conditions')
        .setDescription('By proceeding, you acknowledge and agree to these terms below. Click the buttons to view each terms section.')
        .setFooter({ text: 'Select a section to view detailed terms' })
        .setTimestamp();

    const buttonsRow1 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('tos_product_usage')
                .setLabel('Product Usage')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('tos_payment_terms')
                .setLabel('Payment Terms')
                .setStyle(ButtonStyle.Success)
        );

    const buttonsRow2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('tos_delivery_policy')
                .setLabel('Delivery Policy')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('tos_refund_policy')
                .setLabel('Refund Policy')
                .setStyle(ButtonStyle.Success)
        );

    return { 
        embeds: [embed], 
        components: [buttonsRow1, buttonsRow2] 
    };
}

function createServerTermsEmbed() {
    return new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('📋 Server Terms & Conditions')
        .setDescription('Rules and guidelines for using our Discord server:')
        .addFields(
            { name: '1. Respectful Behavior', value: 'All members must maintain respectful and appropriate behavior at all times.' },
            { name: '2. No Harassment', value: 'Harassment, bullying, or hate speech of any kind is strictly prohibited.' },
            { name: '3. No Spamming', value: 'Do not spam messages, emojis, or mentions in any channels.' },
            { name: '4. Appropriate Content', value: 'Keep all content appropriate and follow Discord\'s Community Guidelines.' },
            { name: '5. Channel Usage', value: 'Use channels for their intended purposes only.' },
            { name: '6. No Self Promotion', value: 'Unsolicited advertising or self-promotion is not allowed.' },
            { name: '7. Follow Staff Instructions', value: 'Always follow instructions from server staff and moderators.' },
            { name: '8. Reporting Issues', value: 'Report any issues or rule violations to staff immediately.' }
        )
        .setFooter({ text: 'Server Terms - Last updated: ' + new Date().toLocaleDateString() })
        .setTimestamp();
}

function createSlotTermsEmbed() {
    return new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle('🎯 Slot Terms & Conditions')
        .setDescription('Terms specific to slot purchases and usage:')
        .addFields(
            { name: '1. Slot Ownership', value: 'Slots are personal channels granted to users for specified durations.' },
            { name: '2. Payment Terms', value: 'All slot payments are final and non-refundable.' },
            { name: '3. Usage Rights', value: 'You may use your slot for personal discussions and activities.' },
            { name: '4. Prohibited Content', value: 'Illegal or inappropriate content is strictly forbidden.' },
            { name: '5. Ping Limits', value: 'Respect daily ping limits or risk temporary restrictions.' },
            { name: '6. Slot Expiration', value: 'Slots automatically expire after the purchased duration.' },
            { name: '7. Renewal Policy', value: 'Slots can be renewed before expiration at current rates.' },
            { name: '8. Termination Rights', value: 'We reserve the right to terminate slots for rule violations.' }
        )
        .setFooter({ text: 'Slot Terms - Last updated: ' + new Date().toLocaleDateString() })
        .setTimestamp();
}

function createServiceTermsEmbed() {
    return new EmbedBuilder()
        .setColor(0xFEE75C)
        .setTitle('⚙️ Service Terms & Conditions')
        .setDescription('Terms governing our services and support:')
        .addFields(
            { name: '1. Service Availability', value: 'We strive for 99% uptime but cannot guarantee uninterrupted service.' },
            { name: '2. Support Scope', value: 'Support is provided for technical issues only during business hours.' },
            { name: '3. Modification Rights', value: 'We reserve the right to modify services and terms at any time.' },
            { name: '4. Liability Limitation', value: 'We are not liable for indirect damages from service use.' },
            { name: '5. Data Protection', value: 'We protect your data but cannot guarantee absolute security.' },
            { name: '6. Third-Party Services', value: 'We are not responsible for third-party service issues.' },
            { name: '7. Service Updates', value: 'Services may be temporarily unavailable for maintenance.' },
            { name: '8. Account Security', value: 'You are responsible for maintaining account security.' }
        )
        .setFooter({ text: 'Service Terms - Last updated: ' + new Date().toLocaleDateString() })
        .setTimestamp();
}

function createMarketingTermsEmbed() {
    return new EmbedBuilder()
        .setColor(0xEB459E)
        .setTitle('📢 Marketing Terms & Conditions')
        .setDescription('Terms related to marketing and communications:')
        .addFields(
            { name: '1. Communication Consent', value: 'By using our services, you agree to receive service-related communications.' },
            { name: '2. Marketing Opt-out', value: 'You may opt-out of promotional communications at any time.' },
            { name: '3. Data Usage', value: 'We may use anonymized data for service improvement and analytics.' },
            { name: '4. Promotional Content', value: 'All promotional content is subject to change without notice.' },
            { name: '5. Referral Programs', value: 'Referral programs have specific terms outlined in program details.' },
            { name: '6. Social Media', value: 'Our social media presence is governed by platform-specific rules.' },
            { name: '7. Content Rights', value: 'We retain rights to all promotional and marketing content.' },
            { name: '8. Compliance', value: 'All marketing activities comply with applicable laws and regulations.' }
        )
        .setFooter({ text: 'Marketing Terms - Last updated: ' + new Date().toLocaleDateString() })
        .setTimestamp();
}

function createProductUsageEmbed() {
    return new EmbedBuilder()
        .setColor(0x57F287)
        .setTitle('📦 Product Usage Terms')
        .setDescription('Terms governing product usage and licensing:')
        .addFields(
            { name: '1. License Grant', value: 'Products are licensed, not sold. You receive a limited usage license.' },
            { name: '2. Usage Restrictions', value: 'Products may not be resold, redistributed, or reverse engineered.' },
            { name: '3. Personal Use', value: 'Products are for personal use unless commercial license is purchased.' },
            { name: '4. Updates & Support', value: 'Product updates and support are provided as described.' },
            { name: '5. Compatibility', value: 'Ensure products are compatible with your system before purchase.' },
            { name: '6. Account Linking', value: 'Some products may require account linking for activation.' },
            { name: '7. Usage Monitoring', value: 'We may monitor product usage to prevent abuse.' },
            { name: '8. License Termination', value: 'Licenses may be terminated for violation of terms.' }
        )
        .setFooter({ text: 'Product Usage Terms - Last updated: ' + new Date().toLocaleDateString() })
        .setTimestamp();
}

function createPaymentTermsEmbed() {
    return new EmbedBuilder()
        .setColor(0xFEE75C)
        .setTitle('💳 Payment Terms & Conditions')
        .setDescription('Terms governing payments and billing:')
        .addFields(
            { name: '1. Payment Methods', value: 'We accept various payment methods as listed during checkout.' },
            { name: '2. Currency', value: 'All prices are in USD unless otherwise specified.' },
            { name: '3. Sales Tax', value: 'Sales tax may be applied based on your location.' },
            { name: '4. Payment Security', value: 'All payments are processed through secure payment gateways.' },
            { name: '5. Failed Payments', value: 'Failed payments may result in service interruption.' },
            { name: '6. Recurring Payments', value: 'Subscription products will auto-renew unless cancelled.' },
            { name: '7. Payment Disputes', value: 'Unauthorized payment disputes may result in account suspension.' },
            { name: '8. Price Changes', value: 'We reserve the right to change prices with notice.' }
        )
        .setFooter({ text: 'Payment Terms - Last updated: ' + new Date().toLocaleDateString() })
        .setTimestamp();
}

function createDeliveryPolicyEmbed() {
    return new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('🚚 Delivery Policy')
        .setDescription('Terms governing product delivery and access:')
        .addFields(
            { name: '1. Instant Delivery', value: 'Digital products are delivered immediately after payment confirmation.' },
            { name: '2. Access Methods', value: 'Products are delivered via download links, codes, or account access.' },
            { name: '3. Delivery Issues', value: 'Contact support immediately if you do not receive your product.' },
            { name: '4. Product Updates', value: 'Updates are delivered through original purchase channels.' },
            { name: '5. Access Duration', value: 'Product access duration varies by product type.' },
            { name: '6. Technical Requirements', value: 'Ensure you meet technical requirements before purchase.' },
            { name: '7. Account Requirements', value: 'Some products require specific platform accounts.' },
            { name: '8. Delivery Confirmation', value: 'Keep delivery confirmation emails for reference.' }
        )
        .setFooter({ text: 'Delivery Policy - Last updated: ' + new Date().toLocaleDateString() })
        .setTimestamp();
}

function createRefundPolicyEmbed() {
    return new EmbedBuilder()
        .setColor(0xEB459E)
        .setTitle('🔄 Refund Policy')
        .setDescription('Terms governing refunds and returns:')
        .addFields(
            { name: '1. Digital Products', value: 'Digital products are generally non-refundable once delivered.' },
            { name: '2. Defective Products', value: 'Refunds are available for genuinely defective products.' },
            { name: '3. Refund Requests', value: 'Refund requests must be submitted within 7 days of purchase.' },
            { name: '4. Approval Process', value: 'Refunds are reviewed case-by-case and not guaranteed.' },
            { name: '5. Subscription Cancellations', value: 'Subscriptions can be cancelled but not refunded for used periods.' },
            { name: '6. Chargeback Policy', value: 'Unauthorized chargebacks will result in permanent ban.' },
            { name: '7. Refund Methods', value: 'Refunds are issued to original payment method.' },
            { name: '8. Policy Changes', value: 'Refund policy may change with notice to users.' }
        )
        .setFooter({ text: 'Refund Policy - Last updated: ' + new Date().toLocaleDateString() })
        .setTimestamp();
}

// Handle TOS interactions
async function handleTosInteraction(interaction) {
    if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'tos_category_select') {
            const selectedValue = interaction.values[0];
            
            await interaction.deferUpdate();

            if (selectedValue === 'general') {
                const generalEmbed = createGeneralTermsEmbed();
                await interaction.editReply(generalEmbed);
            } else if (selectedValue === 'products') {
                const productsEmbed = createProductsTermsEmbed();
                await interaction.editReply(productsEmbed);
            }
        }
    }
    
    if (interaction.isButton()) {
        const buttonId = interaction.customId;
        
        await interaction.deferUpdate();

        let embed;
        
        switch (buttonId) {
            case 'tos_server_terms':
                embed = createServerTermsEmbed();
                break;
            case 'tos_slot_terms':
                embed = createSlotTermsEmbed();
                break;
            case 'tos_service_terms':
                embed = createServiceTermsEmbed();
                break;
            case 'tos_marketing_terms':
                embed = createMarketingTermsEmbed();
                break;
            case 'tos_product_usage':
                embed = createProductUsageEmbed();
                break;
            case 'tos_payment_terms':
                embed = createPaymentTermsEmbed();
                break;
            case 'tos_delivery_policy':
                embed = createDeliveryPolicyEmbed();
                break;
            case 'tos_refund_policy':
                embed = createRefundPolicyEmbed();
                break;
            default:
                return;
        }

        await interaction.editReply({ 
            embeds: [embed], 
            components: interaction.message.components 
        });
    }
}

// HELP SYSTEM
function createHelpEmbed(page = 1) {
    const totalPages = 4;
    
    // Page 1: Main Commands
    if (page === 1) {
        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('🤖 RadioResource - Help System')
            .setDescription('Here are all the available commands organized by category.')
            .addFields(
                { name: '📋 SLOT MANAGEMENT', value: 'Create and manage user slots' },
                { name: '/create', value: 'Create a new slot for a user', inline: true },
                { name: '/delete', value: 'Delete a slot channel', inline: true },
                { name: '/view', value: 'View all active slots', inline: true },
                { name: '/slotlogs', value: 'View slot system logs', inline: true },
                
                { name: '🔧 UTILITY COMMANDS', value: 'General utility functions' },
                { name: '/say', value: 'Make the bot say something', inline: true },
                { name: '/embed', value: 'Create an embed message', inline: true },
                { name: '/stick', value: 'Pin a message to channel top', inline: true },
                { name: '/unstick', value: 'Remove sticky message', inline: true },
                { name: '/categorybroadcast', value: 'Broadcast to category channels', inline: true },
                { name: '/staffping', value: 'Staff ping reminder', inline: true },
                
                { name: '👥 ROLE MANAGEMENT', value: 'Manage user roles' },
                { name: '/giverole', value: 'Give yourself bot\'s highest role', inline: true },
                { name: '/role-give', value: 'Choose a role to get', inline: true },
                { name: '/roleall', value: 'Give role to all members', inline: true }
            )
            .setFooter({ text: `Page 1/${totalPages} • Use buttons to navigate` })
            .setTimestamp();

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('help_first')
                    .setLabel('FIRST')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('help_prev')
                    .setLabel('PREVIOUS')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('help_page_1')
                    .setLabel(`1/${totalPages}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('help_next')
                    .setLabel('NEXT')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('help_last')
                    .setLabel('LAST')
                    .setStyle(ButtonStyle.Primary)
            );

        return { embeds: [embed], components: [buttons] };
    }
    
    // Page 2: Payment & Economy
    else if (page === 2) {
        const embed = new EmbedBuilder()
            .setColor(0x57F287)
            .setTitle('💰 PAYMENT & ECONOMY')
            .setDescription('Payment-related commands and economy system')
            .addFields(
                { name: '💳 PAYPAL COMMANDS', value: 'Manage PayPal information' },
                { name: '/setpp', value: 'Set your PayPal email', inline: true },
                { name: '/setpptos', value: 'Set PayPal TOS for user', inline: true },
                { name: '/paypal', value: 'Get PayPal info for user', inline: true },
                
                { name: '₿ CRYPTO COMMANDS', value: 'Manage cryptocurrency information' },
                { name: '/setcrypto', value: 'Set your crypto wallet', inline: true },
                { name: '/setcryptotos', value: 'Set Crypto TOS for user', inline: true },
                { name: '/crypto', value: 'Get crypto info for user', inline: true },
                
                { name: '🛒 ORDER SYSTEM', value: 'Order management' },
                { name: '/thx', value: 'Send order confirmation', inline: true },
                { name: '/notify', value: 'Notify user they\'re needed', inline: true }
            )
            .setFooter({ text: `Page 2/${totalPages} • Use buttons to navigate` })
            .setTimestamp();

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('help_first')
                    .setLabel('FIRST')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('help_prev')
                    .setLabel('PREVIOUS')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('help_page_2')
                    .setLabel(`2/${totalPages}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('help_next')
                    .setLabel('NEXT')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('help_last')
                    .setLabel('LAST')
                    .setStyle(ButtonStyle.Primary)
            );

        return { embeds: [embed], components: [buttons] };
    }
    
    // Page 3: Moderation Commands
    else if (page === 3) {
        const embed = new EmbedBuilder()
            .setColor(0xED4245)
            .setTitle('🔨 MODERATION COMMANDS')
            .setDescription('Moderation and user management commands')
            .addFields(
                { name: '🛡️ BASIC MODERATION', value: 'User management commands' },
                { name: '/ban', value: 'Ban a user from the server', inline: true },
                { name: '/kick', value: 'Kick a user from the server', inline: true },
                { name: '/timeout', value: 'Timeout a user', inline: true },
                { name: '/untimeout', value: 'Remove timeout from user', inline: true },
                { name: '/mute', value: 'Mute a user in all channels', inline: true },
                { name: '/unmute', value: 'Unmute a user', inline: true },
                
                { name: '⚠️ WARNING SYSTEM', value: 'User warning management' },
                { name: '/warn', value: 'Warn a user', inline: true },
                { name: '/warnings', value: 'View user warnings', inline: true },
                { name: '/clearwarnings', value: 'Clear all warnings for user', inline: true },
                { name: '/removewarning', value: 'Remove specific warning', inline: true },
                
                { name: '🔍 USER MANAGEMENT', value: 'Additional user tools' },
                { name: '/unban', value: 'Unban a user', inline: true },
                { name: '/nick', value: 'Change user nickname', inline: true },
                { name: '/userinfo', value: 'Get user information', inline: true }
            )
            .setFooter({ text: `Page 3/${totalPages} • Use buttons to navigate` })
            .setTimestamp();

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('help_first')
                    .setLabel('FIRST')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('help_prev')
                    .setLabel('PREVIOUS')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('help_page_3')
                    .setLabel(`3/${totalPages}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('help_next')
                    .setLabel('NEXT')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('help_last')
                    .setLabel('LAST')
                    .setStyle(ButtonStyle.Primary)
            );

        return { embeds: [embed], components: [buttons] };
    }
    
    // Page 4: Additional Features
    else if (page === 4) {
        const embed = new EmbedBuilder()
            .setColor(0xFEE75C)
            .setTitle('⚡ ADDITIONAL FEATURES')
            .setDescription('Additional bot features and utilities')
            .addFields(
                { name: '📜 TERMS SYSTEM', value: 'Interactive terms of service' },
                { name: '/tos', value: 'View terms of service', inline: true },
                
                { name: '⏰ REMINDERS', value: 'Personal reminder system' },
                { name: '/remind', value: 'Set a personal reminder', inline: true },
                
                { name: '🔗 HELPFUL LINKS', value: 'Quick access links' },
                { name: 'Carl\'s Board', value: '[Dashboard Link](https://carl.gg)', inline: true },
                { name: 'Commands Guide', value: '[Full Guide](https://guide.carl.gg)', inline: true },
                { name: 'Premium Info', value: '[Premium Features](https://carl.gg/premium)', inline: true },
                
                { name: 'ℹ️ BOT INFO', value: 'About this bot' },
                { name: 'Prefix', value: '`=` or `/` commands', inline: true },
                { name: 'Version', value: '2.0.0', inline: true },
                { name: 'Support', value: 'Contact server staff', inline: true }
            )
            .setFooter({ text: `Page 4/${totalPages} • Use buttons to navigate` })
            .setTimestamp();

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('help_first')
                    .setLabel('FIRST')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('help_prev')
                    .setLabel('PREVIOUS')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('help_page_4')
                    .setLabel(`4/${totalPages}`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('help_next')
                    .setLabel('NEXT')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId('help_last')
                    .setLabel('LAST')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true)
            );

        return { embeds: [embed], components: [buttons] };
    }
}

// Handle help button interactions
async function handleHelpInteraction(interaction) {
    if (!interaction.isButton()) return;
    
    if (!interaction.customId.startsWith('help_')) return;
    
    const action = interaction.customId;
    let page = 1;
    
    // Extract page number from current message if possible
    const currentFooter = interaction.message.embeds[0]?.footer?.text;
    if (currentFooter) {
        const pageMatch = currentFooter.match(/Page (\d+)\//);
        if (pageMatch) {
            page = parseInt(pageMatch[1]);
        }
    }
    
    // Handle navigation
    if (action === 'help_first') page = 1;
    else if (action === 'help_prev') page = Math.max(1, page - 1);
    else if (action === 'help_next') page = Math.min(4, page + 1);
    else if (action === 'help_last') page = 4;
    else if (action.startsWith('help_page_')) {
        page = parseInt(action.split('_')[2]);
    }
    
    const helpEmbed = createHelpEmbed(page);
    await interaction.update({ embeds: helpEmbed.embeds, components: helpEmbed.components });
}

// Create PayPal embed with copy button
function createPayPalEmbed(userId, email, tosUser) {
    const embed = new EmbedBuilder()
        .setColor(0x0070BA)
        .setTitle('💳 PayPal Information')
        .setDescription(`PayPal details for <@${userId}>`)
        .addFields(
            { name: 'Email', value: `\`${email}\``, inline: true },
            { name: 'TOS Set By', value: `<@${tosUser}>`, inline: true },
            { name: 'Note', value: 'Click the button below to copy the email address.' }
        )
        .setTimestamp();

    const copyButton = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`copy_email_${userId}`)
                .setLabel('Copy Email')
                .setStyle(ButtonStyle.Success)
                .setEmoji('📋')
        );

    return { embeds: [embed], components: [copyButton] };
}

// Create Crypto embed with copy button
function createCryptoEmbed(userId, cryptoType, cryptoInfo) {
    const embed = new EmbedBuilder()
        .setColor(0xF7931A)
        .setTitle(`💰 ${cryptoType.toUpperCase()} Information`)
        .setDescription(`${cryptoType.toUpperCase()} details for <@${userId}>`)
        .addFields(
            { name: 'Wallet Address', value: `\`${cryptoInfo.address}\``, inline: false },
            { name: 'TOS Set By', value: `<@${cryptoInfo.tosSetBy || 'Not set'}>`, inline: true }
        )
        .setTimestamp();

    const actionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`copy_address_${userId}_${cryptoType}`)
                .setLabel('Copy Address')
                .setStyle(ButtonStyle.Success)
                .setEmoji('📋')
        );

    return { embeds: [embed], components: [actionRow] };
}

// Load data on startup
loadSlots();
loadSticky();
loadEconomy();
loadSlotLogs();
loadPayPal();
loadCrypto();
loadWarnings();
loadReceipts();

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    // Schedule expiration for existing slots
    slots.forEach(slot => {
        if (slot.expirationTime !== Infinity) {
            scheduleExpiration(slot);
        }
    });
});

// Command registration
const commands = [
    new SlashCommandBuilder()
        .setName('create')
        .setDescription('Create a new slot')
        .addUserOption(option => 
            option.setName('member')
                .setDescription('Member for the slot')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('duration')
                .setDescription('Duration of the slot')
                .setRequired(true)
                .addChoices(
                    { name: '30 Minutes', value: '1800000' },
                    { name: '1 Hour', value: '3600000' },
                    { name: '1 Day', value: '86400000' },
                    { name: '1 Week', value: '604800000' },
                    { name: '1 Month', value: '2592000000' },
                    { name: '1 Year', value: '31536000000' },
                    { name: 'Lifetime', value: 'Infinity' }
                ))
        .addStringOption(option => 
            option.setName('category')
                .setDescription('Select category for the slot')
                .setRequired(true)
                .addChoices(
                    { name: 'Category 1', value: CATEGORIES.CATEGORY_1 },
                    { name: 'Category 2', value: CATEGORIES.CATEGORY_2 }
                ))
        .addStringOption(option =>
            option.setName('slotname')
                .setDescription('Custom name for the slot')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('ping_config')
                .setDescription('Ping configuration (e.g., "1 @here, 0 @everyone")')
                .setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Delete a slot')
        .addChannelOption(option => 
            option.setName('channel')
                .setDescription('Slot channel to delete')
                .setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('view')
        .setDescription('View all active slots'),
    
    new SlashCommandBuilder()
        .setName('say')
        .setDescription('Make the bot say something')
        .addStringOption(option => 
            option.setName('message')
                .setDescription('Message to send')
                .setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('giverole')
        .setDescription('Give yourself the highest role the bot has'),
    
    new SlashCommandBuilder()
        .setName('msg')
        .setDescription('Send a message to a specific user')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to send the message to')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('message')
                .setDescription('The message to send')
                .setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('role-give')
        .setDescription('Choose a role to give yourself')
        .addStringOption(option =>
            option.setName('choice')
                .setDescription('Choose 1 or 2 to get a role')
                .setRequired(true)
                .addChoices(
                    { name: 'Role 1', value: '1' },
                    { name: 'Role 2', value: '2' }
                )),
    
    new SlashCommandBuilder()
        .setName('roleall')
        .setDescription('Give a role to all server members')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to give to everyone')
                .setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Create an embed message')
        .addStringOption(option =>
            option.setName('title')
                .setDescription('The title of the embed')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('The description of the embed')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('color')
                .setDescription('The color of the embed (hex code)')
                .setRequired(false)),
    
    new SlashCommandBuilder()
        .setName('tos')
        .setDescription('Sends the ToS reminder message with interactive categories'),
    
    new SlashCommandBuilder()
        .setName('stick')
        .setDescription('Pin a message to the top of the channel')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message to stick to the top')
                .setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('unstick')
        .setDescription('Remove the sticky message from this channel'),
        
    new SlashCommandBuilder()
        .setName('categorybroadcast')
        .setDescription('Send a message to all channels in a category')
        .addChannelOption(option => 
            option.setName('category')
                .setDescription('Category to broadcast to')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Message to broadcast to all channels')
                .setRequired(true)),
    
    new SlashCommandBuilder()
        .setName('staffping')
        .setDescription('Remind users not to ping staff unnecessarily'),

    new SlashCommandBuilder()
        .setName('slotlogs')
        .setDescription('View slot system logs')
        .addIntegerOption(option =>
            option.setName('count')
                .setDescription('Number of logs to show (default: 10)')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('notify')
        .setDescription('Notify a user that they are needed in DragonSky')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to notify')
                .setRequired(true)),

    // NEW COMMANDS
    new SlashCommandBuilder()
        .setName('setpp')
        .setDescription('Set your PayPal email address')
        .addStringOption(option =>
            option.setName('email')
                .setDescription('Your PayPal email address')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('setpptos')
        .setDescription('Set PayPal TOS for a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to set PayPal TOS for')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('paypal')
        .setDescription('Get PayPal information for a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to get PayPal info for')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('setcrypto')
        .setDescription('Set your crypto wallet address')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of cryptocurrency')
                .setRequired(true)
                .addChoices(
                    { name: 'BTC', value: 'btc' },
                    { name: 'ETH', value: 'eth' },
                    { name: 'LTC', value: 'ltc' },
                    { name: 'BNB', value: 'bnb' },
                    { name: 'USDT', value: 'usdt' },
                    { name: 'USDC', value: 'usdc' }
                ))
        .addStringOption(option =>
            option.setName('address')
                .setDescription('Your wallet address')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('setcryptotos')
        .setDescription('Set Crypto TOS for a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to set Crypto TOS for')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('crypto')
        .setDescription('Get crypto information for a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to get crypto info for')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of cryptocurrency')
                .setRequired(false)
                .addChoices(
                    { name: 'BTC', value: 'btc' },
                    { name: 'ETH', value: 'eth' },
                    { name: 'LTC', value: 'ltc' },
                    { name: 'BNB', value: 'bnb' },
                    { name: 'USDT', value: 'usdt' },
                    { name: 'USDC', value: 'usdc' }
                )),

    new SlashCommandBuilder()
        .setName('remind')
        .setDescription('Set a reminder')
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Time for reminder (e.g., 1h, 30m, 2d)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Reminder message')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('thx')
        .setDescription('Send order confirmation message'),

    // HELP COMMAND
    new SlashCommandBuilder()
        .setName('help')
        .setDescription('Get help with bot commands'),

    // MODERATION COMMANDS
    new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the ban')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('delete_days')
                .setDescription('Number of days of messages to delete (0-7)')
                .setRequired(false)
                .setMinValue(0)
                .setMaxValue(7)),

    new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user from the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the kick')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Timeout a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to timeout')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Duration of timeout (e.g., 1h, 30m, 2d)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the timeout')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('untimeout')
        .setDescription('Remove timeout from a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to remove timeout from')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for removing timeout')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Mute a user in all channels')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to mute')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the mute')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Unmute a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to unmute')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for unmuting')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('warn')
        .setDescription('Warn a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to warn')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for the warning')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('warnings')
        .setDescription('View warnings for a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to view warnings for')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('clearwarnings')
        .setDescription('Clear all warnings for a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to clear warnings for')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('removewarning')
        .setDescription('Remove a specific warning from a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to remove warning from')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('warning_id')
                .setDescription('The ID of the warning to remove')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a user')
        .addStringOption(option =>
            option.setName('user_id')
                .setDescription('The ID of the user to unban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('Reason for unbanning')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('nick')
        .setDescription('Change a user\'s nickname')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to change nickname for')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('nickname')
                .setDescription('The new nickname (leave empty to reset)')
                .setRequired(false)),

    new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Get information about a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to get info for')
                .setRequired(false)),

    // RECEIPT COMMAND
    new SlashCommandBuilder()
        .setName('sendreceipt')
        .setDescription('Send a receipt to a customer')
        .addUserOption(option => 
            option.setName('customer')
                .setDescription('The customer to send receipt to')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('product')
                .setDescription('Product name (e.g., 14x1m server boosts)')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('price')
                .setDescription('Price (e.g., 66$)')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('payment_method')
                .setDescription('Payment method (e.g., Lipscoin)')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('seller')
                .setDescription('Seller name (e.g., unknownshands)')
                .setRequired(true)),

    // VIEW TRANSCRIPT COMMAND
    new SlashCommandBuilder()
        .setName('view')
        .setDescription('View transcript for a ticket')
        .addStringOption(option =>
            option.setName('ticket_id')
                .setDescription('The ticket ID or channel mention')
                .setRequired(true)),

    // PULL COMMAND
    new SlashCommandBuilder()
        .setName('pull')
        .setDescription('Pull transcript & trade information for a ticket')
        .addStringOption(option =>
            option.setName('ticket_id')
                .setDescription('The ticket ID or channel mention')
                .setRequired(false))

].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

// Register commands
(async () => {
    try {
        console.log('Registering commands...');
        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );
        console.log('Commands registered successfully.');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
})();

// Interaction handler
client.on('interactionCreate', async interaction => {
    // Handle receipt email button
    if (interaction.isButton() && interaction.customId === 'enter_email_receipt') {
        const modal = createEmailModal();
        await interaction.showModal(modal);
        return;
    }

    // Handle email modal submission
    if (interaction.isModalSubmit() && interaction.customId === 'email_receipt_modal') {
        const email = interaction.fields.getTextInputValue('email_input');
        
        // Find the most recent receipt for this user
        const receiptEntries = Object.entries(receipts);
        const userReceipt = receiptEntries
            .sort(([,a], [,b]) => b.timestamp - a.timestamp)
            .find(([, receipt]) => receipt.customerId === interaction.user.id);
        
        if (!userReceipt) {
            await interaction.reply({ 
                content: '❌ No receipt found for you. Please contact support.',
                ephemeral: true 
            });
            return;
        }
        
        const [receiptId, receiptData] = userReceipt;
        
        // Send confirmation message
        await interaction.reply({ 
            embeds: [
                new EmbedBuilder()
                    .setColor(0x57F287)
                    .setTitle('✅ Receipt Sent!')
                    .setDescription(`Success! Your receipt has been sent to **${email}**.`)
                    .setTimestamp()
            ],
            ephemeral: true 
        });
        
        // Send actual email
        const emailSent = await sendReceiptEmail(
            email,
            receiptData.product,
            receiptData.price,
            receiptData.paymentMethod,
            receiptData.seller,
            interaction.user.id,
            receiptData.transactionId
        );
        
        if (!emailSent) {
            // Edit the original reply if email fails
            await interaction.editReply({
                content: '❌ Failed to send email. Please try again or contact support.',
                embeds: [],
                ephemeral: true
            });
        }
        
        // Clean up receipt data
        delete receipts[receiptId];
        saveReceipts();
        
        return;
    }
    
    // Handle button interactions (help system)
    if (interaction.isButton() && interaction.customId.startsWith('help_')) {
        return handleHelpInteraction(interaction);
    }
    
    // Handle button interactions (copy address buttons)
    if (interaction.isButton()) {
        // Handle copy address button
        if (interaction.customId.startsWith('copy_address_')) {
            const [_, __, userId, cryptoType] = interaction.customId.split('_');
            
            let copyText = '';
            if (cryptoData[userId] && cryptoData[userId][cryptoType]) {
                copyText = cryptoData[userId][cryptoType].address;
            }

            if (copyText) {
                // Simply send the address as a normal message
                await interaction.reply({
                    content: `**${cryptoType.toUpperCase()} Address for <@${userId}>:**\n\`${copyText}\``,
                    ephemeral: false
                });
            } else {
                await interaction.reply({
                    content: '❌ Could not find address to copy.',
                    ephemeral: true
                });
            }
            return;
        }
        
        // Handle copy email button
        if (interaction.customId.startsWith('copy_email_')) {
            const [_, __, userId] = interaction.customId.split('_');
            
            let copyText = '';
            if (paypalData[userId] && paypalData[userId].email) {
                copyText = paypalData[userId].email;
            }

            if (copyText) {
                // Simply send the email as a normal message
                await interaction.reply({
                    content: `**PayPal Email for <@${userId}>:**\n\`${copyText}\``,
                    ephemeral: false
                });
            } else {
                await interaction.reply({
                    content: '❌ Could not find email to copy.',
                    ephemeral: true
                });
            }
            return;
        }
        
        // Handle TOS interactions
        return handleTosInteraction(interaction);
    }

    // Handle select menu interactions
    if (interaction.isStringSelectMenu()) {
        return handleTosInteraction(interaction);
    }

    if (!interaction.isCommand()) return;

    // Permission check for new commands
    const newCommands = ['setpp', 'setpptos', 'paypal', 'setcrypto', 'setcryptotos', 'crypto', 'remind', 'thx', 'sendreceipt', 'view', 'pull'];
    
    if (newCommands.includes(interaction.commandName)) {
        if (!hasAllowedRole(interaction.member)) {
            return interaction.reply({
                content: '❌ You do not have permission to use this command. Required roles: 1377961200767336448, 1414227235728261170, 1377961208350507129, 1408125531869937825',
                ephemeral: true,
            });
        }
    }

    // Permission check for moderation commands
    const modCommands = ['ban', 'kick', 'timeout', 'untimeout', 'mute', 'unmute', 'warn', 'warnings', 'clearwarnings', 'removewarning', 'unban', 'nick', 'userinfo'];
    
    if (modCommands.includes(interaction.commandName)) {
        if (!hasModPermission(interaction.member)) {
            return interaction.reply({
                content: '❌ You do not have permission to use moderation commands.',
                ephemeral: true,
            });
        }
    }

    // Permission check for other commands
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) && !newCommands.includes(interaction.commandName) && !modCommands.includes(interaction.commandName)) {
        return interaction.reply({
            content: 'You do not have permission to use this command. Only Administrators can use bot commands.',
            ephemeral: true,
        });
    }

    const { commandName, options } = interaction;

    try {
        if (commandName === 'create') {
            const user = options.getUser('member');
            const durationValue = options.getString('duration');
            const duration = durationValue === 'Infinity' ? Infinity : parseInt(durationValue);
            const categoryId = options.getString('category');
            const slotName = options.getString('slotname');
            const pingConfigInput = options.getString('ping_config');
            
            await createSlot(interaction, user, duration, pingConfigInput, slotName, categoryId);
            await interaction.reply({ 
                content: `Slot "${slotName}" created for ${user.tag} in ${categoryId === CATEGORIES.CATEGORY_1 ? 'Category 1' : 'Category 2'} with ping configuration: ${pingConfigInput}`,
                ephemeral: true 
            });
        }
        else if (commandName === 'delete') {
            const channel = options.getChannel('channel');
            const slotIndex = slots.findIndex(slot => slot.channelId === channel.id);
            if (slotIndex === -1) {
                return interaction.reply('This channel is not associated with any active slot.');
            }
            const slot = slots[slotIndex];
            await interaction.reply(`Slot channel ${channel.name} has been deleted.`);
            const fetchedChannel = await client.channels.fetch(channel.id).catch(() => null);
            if (fetchedChannel) {
                await fetchedChannel.delete().catch(console.error);
            }
            slots.splice(slotIndex, 1);
            saveSlots();
            
            // Log deletion
            addSlotLog('Slot-Deleted', `Slot deleted by ${interaction.user.tag}`, slot);
        }
        else if (commandName === 'view') {
            if (slots.length === 0) {
                return interaction.reply('There are no active slots.');
            }
            const slotDetails = slots.map(slot => {
                const remainingTime = slot.expirationTime === Infinity ? 'Lifetime' : 
                    `${Math.ceil((slot.expirationTime - Date.now()) / (1000 * 60 * 60 * 24))} days`;
                const pingConfig = Object.entries(slot.pingConfig)
                    .map(([type, limit]) => `${limit}x ${type}`)
                    .join(', ');
                return `- <#${slot.channelId}> (${slot.slotName}): Owned by <@${slot.userId}> (Expires in ${remainingTime}, Ping Config: ${pingConfig}, Category: ${slot.category})`;
            }).join('\n');
            
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Active Slots')
                .setDescription(slotDetails)
                .setTimestamp();
                
            await interaction.reply({ embeds: [embed] });
        }
        else if (commandName === 'say') {
            const message = options.getString('message');
            await interaction.channel.send(message);
            await interaction.reply({ content: 'Message sent!', ephemeral: true });
        }
        else if (commandName === 'giverole') {
            const botMember = interaction.guild.members.cache.get(client.user.id);
            const botHighestRole = botMember.roles.highest;
            if (botHighestRole) {
                await interaction.member.roles.add(botHighestRole);
                await interaction.reply(`You have been given the role: ${botHighestRole.name}`);
            } else {
                await interaction.reply('The bot does not have any roles.');
            }
        }
        else if (commandName === 'msg') {
            const user = options.getUser('user');
            const messageContent = options.getString('message');
            try {
                await user.send(messageContent);
                await interaction.reply({ 
                    content: `Message sent to ${user.tag}: ${messageContent}`, 
                    ephemeral: true 
                });
            } catch (error) {
                console.error('Error sending message:', error);
                await interaction.reply({ 
                    content: 'Failed to send the message. The user may have DMs disabled.', 
                    ephemeral: true 
                });
            }
        }
        else if (commandName === 'role-give') {
            const choice = options.getString('choice');
            const roleId = choice === '1' ? '1345745304032645205' : '1147465284047863848';
            const role = interaction.guild.roles.cache.get(roleId);
            if (!role) {
                return interaction.reply({
                    content: 'The specified role does not exist.',
                    ephemeral: true,
                });
            }
            try {
                await interaction.member.roles.add(role);
                await interaction.reply({
                    content: `You have been given the role: ${role.name}.`,
                    ephemeral: true,
                });
            } catch (error) {
                console.error('Error giving role:', error);
                await interaction.reply({
                    content: 'Failed to give the role. Please check the bot\'s permissions and role hierarchy.',
                    ephemeral: true,
                });
            }
        }
        else if (commandName === 'roleall') {
            const role = options.getRole('role');
            if (!role) {
                return interaction.reply({
                    content: 'Please specify a valid role.',
                    ephemeral: true
                });
            }
            if (role.position >= interaction.guild.members.me.roles.highest.position) {
                return interaction.reply({
                    content: "I can't manage that role because it's higher than or equal to my highest role.",
                    ephemeral: true
                });
            }
            await interaction.deferReply({ ephemeral: true });
            try {
                const members = await interaction.guild.members.fetch();
                let successCount = 0;
                let failCount = 0;
                for (const member of members.values()) {
                    try {
                        if (!member.roles.cache.has(role.id)) {
                            await member.roles.add(role);
                            successCount++;
                        }
                    } catch (error) {
                        console.error(`Failed to add role to ${member.user.tag}:`, error);
                        failCount++;
                    }
                }
                await interaction.editReply({
                    content: `Successfully added the role to ${successCount} members. Failed to add to ${failCount} members.`
                });
            } catch (error) {
                console.error('Error fetching members:', error);
                await interaction.editReply({
                    content: 'An error occurred while processing members.'
                });
            }
        }
        else if (commandName === 'embed') {
            const title = options.getString('title');
            const description = options.getString('description');
            const color = options.getString('color') || '#0099ff';

            const isValidColor = /^#([0-9A-F]{3}){1,2}$/i.test(color);
            const embedColor = isValidColor ? color : '#0099ff';

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor(embedColor)
                .setTimestamp();

            await interaction.channel.send({ embeds: [embed] });
            await interaction.reply({ content: 'Embed created!', ephemeral: true });
        }
        else if (commandName === 'tos') {
            try {
                // Defer and delete to hide command usage
                await interaction.deferReply({ ephemeral: true });
                await interaction.deleteReply();
                // Send the new interactive ToS embed
                const tosMessage = createTosEmbed();
                await interaction.channel.send(tosMessage);
            } catch (error) {
                console.error('Error in /tos:', error);
            }
        }
        else if (commandName === 'stick') {
            const messageContent = options.getString('message');
            const channel = interaction.channel;
            if (stickyMessages[channel.id]) {
                try {
                    const oldMessage = await channel.messages.fetch(stickyMessages[channel.id].messageId);
                    await oldMessage.delete();
                } catch (error) {
                    console.error('Error deleting old sticky message:', error);
                }
            }
            const newMessage = await channel.send(messageContent);
            stickyMessages[channel.id] = {
                messageId: newMessage.id,
                content: messageContent
            };
            saveSticky();
            await interaction.reply({ 
                content: 'Message has been stuck to the top of this channel!',
                ephemeral: true 
            });
        }
        else if (commandName === 'unstick') {
            const channel = interaction.channel;
            if (!stickyMessages[channel.id]) {
                return interaction.reply({ 
                    content: 'There is no sticky message in this channel!',
                    ephemeral: true 
                });
            }
            try {
                const oldMessage = await channel.messages.fetch(stickyMessages[channel.id].messageId);
                await oldMessage.delete();
            } catch (error) {
                console.error('Error deleting sticky message:', error);
            }
            delete stickyMessages[channel.id];
            saveSticky();
            await interaction.reply({ 
                content: 'Sticky message has been removed from this channel!',
                ephemeral: true 
            });
        }
        else if (commandName === 'categorybroadcast') {
            const category = options.getChannel('category');
            const message = options.getString('message');
            if (category.type !== 4) {
                return interaction.reply({ content: 'You must select a category channel!', ephemeral: true });
            }
            await interaction.deferReply({ ephemeral: true });
            try {
                const channels = interaction.guild.channels.cache.filter(
                    channel => channel.parentId === category.id && channel.type === 0
                );
                if (channels.size === 0) {
                    return interaction.editReply({ content: 'No text channels found in this category!', ephemeral: true });
                }
                let successCount = 0;
                let failCount = 0;
                for (const [_, channel] of channels) {
                    try {
                        await channel.send(message);
                        successCount++;
                    } catch (error) {
                        console.error(`Failed to send message to ${channel.name}:`, error);
                        failCount++;
                    }
                }
                await interaction.editReply({
                    content: `Message sent to ${successCount} channels in the category "${category.name}". Failed to send to ${failCount} channels.`,
                    ephemeral: true
                });
            } catch (error) {
                console.error('Error broadcasting to category channels:', error);
                await interaction.editReply({ content: 'An error occurred while broadcasting the message.', ephemeral: true });
            }
        }
        else if (commandName === 'staffping') {
            const embed = new EmbedBuilder()
                .setTitle('⚠️ Staff Ping Reminder')
                .setDescription('Please Avoid Pinging Staff!')
                .addFields(
                    { name: '\u200B', value: 'Pinging Staff will NOT make them look at your Ticket faster, and could actually delay their response.' },
                    { name: '\u200B', value: 'Staff will respond to tickets in the order they are received. Please be patient!' }
                )
                .setColor(0xFFA500)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
        else if (commandName === 'slotlogs') {
            const count = options.getInteger('count') || 10;
            const recentLogs = slotLogs.slice(-count).reverse();
            
            if (recentLogs.length === 0) {
                return interaction.reply({ content: 'No slot logs found.', ephemeral: true });
            }
            
            const logEmbed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(`Recent Slot Logs (Last ${recentLogs.length})`)
                .setDescription(recentLogs.map(log => 
                    `**${new Date(log.timestamp).toLocaleString()}** - ${log.action}\n${log.details}`
                ).join('\n\n'))
                .setTimestamp();
            
            await interaction.reply({ embeds: [logEmbed], ephemeral: true });
        }
        else if (commandName === 'notify') {
            const user = options.getUser('user');
            const currentChannel = interaction.channel;
            
            try {
                // Send DM to the user with channel link
                await user.send(`You are Needed in DragonSky! Please go check <#${currentChannel.id}>.`);
                
                await interaction.reply({ 
                    content: `✅ Notification sent to ${user.tag}! They were directed to this channel.`,
                    ephemeral: true 
                });
                
                console.log(`Notification sent to ${user.tag} by ${interaction.user.tag} - Redirected to channel: ${currentChannel.name}`);
            } catch (error) {
                console.error('Error sending notification:', error);
                await interaction.reply({ 
                    content: `❌ Failed to send notification to ${user.tag}. They may have DMs disabled.`,
                    ephemeral: true 
                });
            }
        }
        else if (commandName === 'help') {
            const helpEmbed = createHelpEmbed(1);
            await interaction.reply({ embeds: helpEmbed.embeds, components: helpEmbed.components, ephemeral: true });
        }

        // MODERATION COMMANDS HANDLERS
        else if (commandName === 'ban') {
            const user = options.getUser('user');
            const reason = options.getString('reason') || 'No reason provided';
            const deleteDays = options.getInteger('delete_days') || 0;

            if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
                return interaction.reply({
                    content: '❌ I do not have permission to ban members.',
                    ephemeral: true
                });
            }

            const member = await interaction.guild.members.fetch(user.id).catch(() => null);
            
            if (!member) {
                return interaction.reply({
                    content: '❌ User not found in this server.',
                    ephemeral: true
                });
            }

            if (!member.bannable) {
                return interaction.reply({
                    content: '❌ I cannot ban this user. They may have a higher role than me.',
                    ephemeral: true
                });
            }

            try {
                await member.ban({ reason: `${reason} - Banned by ${interaction.user.tag}`, deleteMessageDays: deleteDays });
                
                const embed = createModLogEmbed('ban', user, interaction.user, reason);
                await sendModLog(embed);
                
                await interaction.reply({
                    content: `✅ Successfully banned ${user.tag}. ${deleteDays > 0 ? `Deleted ${deleteDays} days of messages.` : ''}`,
                    ephemeral: true
                });
            } catch (error) {
                console.error('Error banning user:', error);
                await interaction.reply({
                    content: '❌ Failed to ban user.',
                    ephemeral: true
                });
            }
        }
        else if (commandName === 'kick') {
            const user = options.getUser('user');
            const reason = options.getString('reason') || 'No reason provided';

            if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
                return interaction.reply({
                    content: '❌ I do not have permission to kick members.',
                    ephemeral: true
                });
            }

            const member = await interaction.guild.members.fetch(user.id).catch(() => null);
            
            if (!member) {
                return interaction.reply({
                    content: '❌ User not found in this server.',
                    ephemeral: true
                });
            }

            if (!member.kickable) {
                return interaction.reply({
                    content: '❌ I cannot kick this user. They may have a higher role than me.',
                    ephemeral: true
                });
            }

            try {
                await member.kick(`${reason} - Kicked by ${interaction.user.tag}`);
                
                const embed = createModLogEmbed('kick', user, interaction.user, reason);
                await sendModLog(embed);
                
                await interaction.reply({
                    content: `✅ Successfully kicked ${user.tag}.`,
                    ephemeral: true
                });
            } catch (error) {
                console.error('Error kicking user:', error);
                await interaction.reply({
                    content: '❌ Failed to kick user.',
                    ephemeral: true
                });
            }
        }
        else if (commandName === 'timeout') {
            const user = options.getUser('user');
            const durationStr = options.getString('duration');
            const reason = options.getString('reason') || 'No reason provided';

            if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
                return interaction.reply({
                    content: '❌ I do not have permission to timeout members.',
                    ephemeral: true
                });
            }

            const duration = parseTime(durationStr);
            if (!duration) {
                return interaction.reply({
                    content: '❌ Invalid duration format. Use: 1h (1 hour), 30m (30 minutes), 2d (2 days)',
                    ephemeral: true
                });
            }

            // Discord timeout limit is 28 days
            if (duration > 28 * 24 * 60 * 60 * 1000) {
                return interaction.reply({
                    content: '❌ Timeout duration cannot exceed 28 days.',
                    ephemeral: true
                });
            }

            const member = await interaction.guild.members.fetch(user.id).catch(() => null);
            
            if (!member) {
                return interaction.reply({
                    content: '❌ User not found in this server.',
                    ephemeral: true
                });
            }

            if (!member.moderatable) {
                return interaction.reply({
                    content: '❌ I cannot timeout this user. They may have a higher role than me.',
                    ephemeral: true
                });
            }

            try {
                const timeoutUntil = new Date(Date.now() + duration);
                await member.timeout(duration, `${reason} - Timed out by ${interaction.user.tag}`);
                
                const embed = createModLogEmbed('timeout', user, interaction.user, reason, duration);
                await sendModLog(embed);
                
                await interaction.reply({
                    content: `✅ Successfully timed out ${user.tag} for ${formatDuration(duration)}.`,
                    ephemeral: true
                });
            } catch (error) {
                console.error('Error timing out user:', error);
                await interaction.reply({
                    content: '❌ Failed to timeout user.',
                    ephemeral: true
                });
            }
        }
        else if (commandName === 'untimeout') {
            const user = options.getUser('user');
            const reason = options.getString('reason') || 'No reason provided';

            if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
                return interaction.reply({
                    content: '❌ I do not have permission to remove timeouts.',
                    ephemeral: true
                });
            }

            const member = await interaction.guild.members.fetch(user.id).catch(() => null);
            
            if (!member) {
                return interaction.reply({
                    content: '❌ User not found in this server.',
                    ephemeral: true
                });
            }

            if (!member.moderatable) {
                return interaction.reply({
                    content: '❌ I cannot modify this user\'s timeout. They may have a higher role than me.',
                    ephemeral: true
                });
            }

            if (!member.isCommunicationDisabled()) {
                return interaction.reply({
                    content: '❌ This user is not timed out.',
                    ephemeral: true
                });
            }

            try {
                await member.timeout(null, `${reason} - Timeout removed by ${interaction.user.tag}`);
                
                const embed = createModLogEmbed('untimeout', user, interaction.user, reason);
                await sendModLog(embed);
                
                await interaction.reply({
                    content: `✅ Successfully removed timeout from ${user.tag}.`,
                    ephemeral: true
                });
            } catch (error) {
                console.error('Error removing timeout:', error);
                await interaction.reply({
                    content: '❌ Failed to remove timeout.',
                    ephemeral: true
                });
            }
        }
        else if (commandName === 'mute') {
            const user = options.getUser('user');
            const reason = options.getString('reason') || 'No reason provided';

            // For mute, we'll create a muted role if it doesn't exist and apply it
            let mutedRole = interaction.guild.roles.cache.find(role => role.name === 'Muted');
            
            if (!mutedRole) {
                try {
                    mutedRole = await interaction.guild.roles.create({
                        name: 'Muted',
                        color: '#000000',
                        reason: 'Muted role for moderation'
                    });

                    // Set permissions for all channels
                    interaction.guild.channels.cache.forEach(async (channel) => {
                        try {
                            await channel.permissionOverwrites.create(mutedRole, {
                                SendMessages: false,
                                AddReactions: false,
                                Speak: false
                            });
                        } catch (error) {
                            console.error(`Error setting permissions for channel ${channel.name}:`, error);
                        }
                    });
                } catch (error) {
                    console.error('Error creating muted role:', error);
                    return interaction.reply({
                        content: '❌ Failed to create muted role. Please create a "Muted" role manually.',
                        ephemeral: true
                    });
                }
            }

            const member = await interaction.guild.members.fetch(user.id).catch(() => null);
            
            if (!member) {
                return interaction.reply({
                    content: '❌ User not found in this server.',
                    ephemeral: true
                });
            }

            try {
                await member.roles.add(mutedRole, `${reason} - Muted by ${interaction.user.tag}`);
                
                const embed = createModLogEmbed('mute', user, interaction.user, reason);
                await sendModLog(embed);
                
                await interaction.reply({
                    content: `✅ Successfully muted ${user.tag}.`,
                    ephemeral: true
                });
            } catch (error) {
                console.error('Error muting user:', error);
                await interaction.reply({
                    content: '❌ Failed to mute user.',
                    ephemeral: true
                });
            }
        }
        else if (commandName === 'unmute') {
            const user = options.getUser('user');
            const reason = options.getString('reason') || 'No reason provided';

            const mutedRole = interaction.guild.roles.cache.find(role => role.name === 'Muted');
            
            if (!mutedRole) {
                return interaction.reply({
                    content: '❌ Muted role not found.',
                    ephemeral: true
                });
            }

            const member = await interaction.guild.members.fetch(user.id).catch(() => null);
            
            if (!member) {
                return interaction.reply({
                    content: '❌ User not found in this server.',
                    ephemeral: true
                });
            }

            if (!member.roles.cache.has(mutedRole.id)) {
                return interaction.reply({
                    content: '❌ This user is not muted.',
                    ephemeral: true
                });
            }

            try {
                await member.roles.remove(mutedRole, `${reason} - Unmuted by ${interaction.user.tag}`);
                
                const embed = createModLogEmbed('unmute', user, interaction.user, reason);
                await sendModLog(embed);
                
                await interaction.reply({
                    content: `✅ Successfully unmuted ${user.tag}.`,
                    ephemeral: true
                });
            } catch (error) {
                console.error('Error unmuting user:', error);
                await interaction.reply({
                    content: '❌ Failed to unmute user.',
                    ephemeral: true
                });
            }
        }
        else if (commandName === 'warn') {
            const user = options.getUser('user');
            const reason = options.getString('reason') || 'No reason provided';

            const warning = addWarning(user.id, interaction.user.id, reason);
            const userWarnings = getUserWarnings(user.id);

            const embed = createModLogEmbed('warn', user, interaction.user, reason);
            await sendModLog(embed);

            await interaction.reply({
                content: `✅ Warned ${user.tag}. They now have ${userWarnings.length} warning(s).\n**Reason:** ${reason}\n**Warning ID:** ${warning.id}`,
                ephemeral: true
            });
        }
        else if (commandName === 'warnings') {
            const user = options.getUser('user');
            const userWarnings = getUserWarnings(user.id);

            if (userWarnings.length === 0) {
                return interaction.reply({
                    content: `✅ ${user.tag} has no warnings.`,
                    ephemeral: true
                });
            }

            const warningsList = userWarnings.map(warning => 
                `**ID:** ${warning.id} | **Date:** ${new Date(warning.timestamp).toLocaleDateString()}\n**Reason:** ${warning.reason}\n**By:** <@${warning.moderatorId}>\n`
            ).join('\n');

            const embed = new EmbedBuilder()
                .setColor(0xFEE75C)
                .setTitle(`⚠️ Warnings for ${user.tag}`)
                .setDescription(warningsList)
                .setFooter({ text: `Total warnings: ${userWarnings.length}` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
        else if (commandName === 'clearwarnings') {
            const user = options.getUser('user');
            const userWarnings = getUserWarnings(user.id);

            if (userWarnings.length === 0) {
                return interaction.reply({
                    content: `✅ ${user.tag} has no warnings to clear.`,
                    ephemeral: true
                });
            }

            const cleared = clearWarnings(user.id);
            
            if (cleared) {
                await interaction.reply({
                    content: `✅ Cleared all warnings for ${user.tag}.`,
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: '❌ Failed to clear warnings.',
                    ephemeral: true
                });
            }
        }
        else if (commandName === 'removewarning') {
            const user = options.getUser('user');
            const warningId = options.getString('warning_id');

            const removed = removeWarning(user.id, warningId);
            
            if (removed) {
                await interaction.reply({
                    content: `✅ Removed warning ${warningId} from ${user.tag}.`,
                    ephemeral: true
                });
            } else {
                await interaction.reply({
                    content: '❌ Warning not found or failed to remove.',
                    ephemeral: true
                });
            }
        }
        else if (commandName === 'unban') {
            const userId = options.getString('user_id');
            const reason = options.getString('reason') || 'No reason provided';

            if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
                return interaction.reply({
                    content: '❌ I do not have permission to unban members.',
                    ephemeral: true
                });
            }

            try {
                await interaction.guild.members.unban(userId, `${reason} - Unbanned by ${interaction.user.tag}`);
                
                const user = await client.users.fetch(userId).catch(() => ({ tag: 'Unknown User', id: userId }));
                
                const embed = createModLogEmbed('unban', user, interaction.user, reason);
                await sendModLog(embed);
                
                await interaction.reply({
                    content: `✅ Successfully unbanned user with ID ${userId}.`,
                    ephemeral: true
                });
            } catch (error) {
                console.error('Error unbanning user:', error);
                await interaction.reply({
                    content: '❌ Failed to unban user. They may not be banned.',
                    ephemeral: true
                });
            }
        }
        else if (commandName === 'nick') {
            const user = options.getUser('user');
            const nickname = options.getString('nickname');

            if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
                return interaction.reply({
                    content: '❌ I do not have permission to manage nicknames.',
                    ephemeral: true
                });
            }

            const member = await interaction.guild.members.fetch(user.id).catch(() => null);
            
            if (!member) {
                return interaction.reply({
                    content: '❌ User not found in this server.',
                    ephemeral: true
                });
            }

            if (!member.manageable) {
                return interaction.reply({
                    content: '❌ I cannot change this user\'s nickname. They may have a higher role than me.',
                    ephemeral: true
                });
            }

            try {
                await member.setNickname(nickname, `Nickname changed by ${interaction.user.tag}`);
                
                await interaction.reply({
                    content: `✅ Successfully ${nickname ? `changed ${user.tag}'s nickname to "${nickname}"` : `reset ${user.tag}'s nickname`}.`,
                    ephemeral: true
                });
            } catch (error) {
                console.error('Error changing nickname:', error);
                await interaction.reply({
                    content: '❌ Failed to change nickname.',
                    ephemeral: true
                });
            }
        }
        else if (commandName === 'userinfo') {
            const user = options.getUser('user') || interaction.user;
            const member = await interaction.guild.members.fetch(user.id).catch(() => null);

            if (!member) {
                return interaction.reply({
                    content: '❌ User not found in this server.',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setColor(member.displayHexColor || 0x0099FF)
                .setTitle(`👤 User Info - ${user.tag}`)
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: 'ID', value: user.id, inline: true },
                    { name: 'Username', value: user.username, inline: true },
                    { name: 'Discriminator', value: user.discriminator, inline: true },
                    { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
                    { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                    { name: 'Nickname', value: member.nickname || 'None', inline: true },
                    { name: 'Roles', value: member.roles.cache.size > 1 ? member.roles.cache.filter(role => role.id !== interaction.guild.id).map(role => role.toString()).join(', ') : 'None', inline: false },
                    { name: 'Highest Role', value: member.roles.highest.toString(), inline: true },
                    { name: 'Warnings', value: getUserWarnings(user.id).length.toString(), inline: true }
                )
                .setFooter({ text: `Requested by ${interaction.user.tag}` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }

        // NEW COMMANDS HANDLERS
        else if (commandName === 'setpp') {
            const email = options.getString('email');
            const userId = interaction.user.id;

            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return interaction.reply({
                    content: '❌ Please provide a valid email address.',
                    ephemeral: true
                });
            }

            if (!paypalData[userId]) {
                paypalData[userId] = {};
            }

            paypalData[userId].email = email;
            paypalData[userId].setBy = interaction.user.id;
            paypalData[userId].setAt = Date.now();

            savePayPal();

            await interaction.reply({
                content: `✅ Your PayPal email has been set to: \`${email}\``,
                ephemeral: true
            });
        }
        else if (commandName === 'setpptos') {
            const user = options.getUser('user');
            
            if (!paypalData[user.id]) {
                paypalData[user.id] = {};
            }

            paypalData[user.id].tosSetBy = interaction.user.id;
            paypalData[user.id].tosSetAt = Date.now();

            savePayPal();

            await interaction.reply({
                content: `✅ PayPal TOS has been set for <@${user.id}> by <@${interaction.user.id}>`,
                ephemeral: true
            });
        }
        else if (commandName === 'paypal') {
            const user = options.getUser('user');
            
            if (!paypalData[user.id] || !paypalData[user.id].email) {
                return interaction.reply({
                    content: `❌ No PayPal information found for <@${user.id}>`,
                    ephemeral: true
                });
            }

            const paypalInfo = paypalData[user.id];
            const tosUser = paypalInfo.tosSetBy || 'Not set';

            const paypalEmbed = createPayPalEmbed(user.id, paypalInfo.email, tosUser);
            await interaction.reply(paypalEmbed);
        }
        else if (commandName === 'setcrypto') {
            const cryptoType = options.getString('type');
            const address = options.getString('address');
            const userId = interaction.user.id;

            if (!cryptoData[userId]) {
                cryptoData[userId] = {};
            }

            cryptoData[userId][cryptoType] = {
                address: address,
                setBy: interaction.user.id,
                setAt: Date.now()
            };

            saveCrypto();

            await interaction.reply({
                content: `✅ Your ${cryptoType.toUpperCase()} address has been set to: \`${address}\``,
                ephemeral: true
            });
        }
        else if (commandName === 'setcryptotos') {
            const user = options.getUser('user');
            
            if (!cryptoData[user.id]) {
                cryptoData[user.id] = {};
            }

            // Set TOS for all crypto types for this user
            for (const cryptoType in cryptoData[user.id]) {
                cryptoData[user.id][cryptoType].tosSetBy = interaction.user.id;
                cryptoData[user.id][cryptoType].tosSetAt = Date.now();
            }

            saveCrypto();

            await interaction.reply({
                content: `✅ Crypto TOS has been set for <@${user.id}> by <@${interaction.user.id}>`,
                ephemeral: true
            });
        }
        else if (commandName === 'crypto') {
            const user = options.getUser('user');
            const cryptoType = options.getString('type')?.toLowerCase() || 'btc'; // Default to BTC
            
            if (!cryptoData[user.id] || !cryptoData[user.id][cryptoType]) {
                return interaction.reply({
                    content: `❌ No ${cryptoType.toUpperCase()} information found for <@${user.id}>`,
                    ephemeral: true
                });
            }

            const cryptoInfo = cryptoData[user.id][cryptoType];
            const cryptoEmbed = createCryptoEmbed(user.id, cryptoType, cryptoInfo);
            await interaction.reply(cryptoEmbed);
        }
        else if (commandName === 'remind') {
            const timeString = options.getString('time');
            const message = options.getString('message');

            // Parse time string (e.g., 1h, 30m, 2d)
            const timeRegex = /^(\d+)([hmd])$/;
            const match = timeString.match(timeRegex);

            if (!match) {
                return interaction.reply({
                    content: '❌ Invalid time format. Use: 1h (1 hour), 30m (30 minutes), 2d (2 days)',
                    ephemeral: true
                });
            }

            const value = parseInt(match[1]);
            const unit = match[2];

            let milliseconds;
            switch (unit) {
                case 'm': milliseconds = value * 60 * 1000; break;
                case 'h': milliseconds = value * 60 * 60 * 1000; break;
                case 'd': milliseconds = value * 24 * 60 * 60 * 1000; break;
                default: milliseconds = value * 60 * 1000;
            }

            const reminderTime = new Date(Date.now() + milliseconds);

            schedule.scheduleJob(reminderTime, async () => {
                try {
                    await interaction.user.send(`🔔 Reminder: ${message}`);
                } catch (error) {
                    console.error('Failed to send reminder DM:', error);
                    // Try to send in the channel instead
                    await interaction.channel.send(`<@${interaction.user.id}> 🔔 Reminder: ${message}`).catch(console.error);
                }
            });

            await interaction.reply({
                content: `✅ I'll remind you about "${message}" in ${timeString}`,
                ephemeral: true
            });
        }
        else if (commandName === 'thx') {
            await interaction.reply(':ah_love: Your order has been noted and you are in queue. Please stay patient and your order will be delivered soon!');
        }

        // RECEIPT COMMAND HANDLER
        else if (commandName === 'sendreceipt') {
            const customer = options.getUser('customer');
            const product = options.getString('product');
            const price = options.getString('price');
            const paymentMethod = options.getString('payment_method');
            const seller = options.getString('seller');

            // Store receipt data temporarily
            const receiptId = generateTransactionId();
            receipts[receiptId] = {
                customerId: customer.id,
                product: product,
                price: price,
                paymentMethod: paymentMethod,
                seller: seller,
                timestamp: Date.now(),
                transactionId: receiptId
            };
            saveReceipts();

            // Create and send the receipt message
            const receiptMessage = createReceiptMessage(product, price, seller);
            await interaction.reply({ 
                content: `<@${customer.id}>`, 
                ...receiptMessage 
            });
        }

        // VIEW TRANSCRIPT COMMAND HANDLER
        else if (commandName === 'view') {
            const ticketIdentifier = options.getString('ticket_id');
            await handleViewTranscript(interaction, ticketIdentifier);
        }

        // PULL COMMAND HANDLER
        else if (commandName === 'pull') {
            const ticketIdentifier = options.getString('ticket_id');
            if (!ticketIdentifier) {
                // If no ticket ID provided, show quick help
                return handleQuickPull(interaction);
            }
            await handlePullCommand(interaction, ticketIdentifier);
        }

    } catch (error) {
        console.error(`Error handling command ${commandName}:`, error);
        await interaction.reply({ 
            content: 'There was an error while executing this command!', 
            ephemeral: true 
        });
    }
});

// Enhanced slot ping handling
async function handleSlotPings(message, slot) {
    if (message.author.id !== slot.userId) return;
    
    const pingType = message.mentions.everyone ? '@everyone' : message.mentions.here ? '@here' : null;
    
    if (pingType && slot.pingConfig[pingType]) {
        // Check if user has remaining pings
        if (slot.pingCounts[pingType] < slot.pingConfig[pingType]) {
            slot.pingCounts[pingType] += 1;
            
            // Send ping usage update
            await sendPingUsageUpdate(message.channel, slot, pingType);
            
            // Check if this ping used up ALL remaining pings for this type
            if (slot.pingCounts[pingType] >= slot.pingConfig[pingType]) {
                await updateSlotPermissions(slot, false);
                
                const warningEmbed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('Ping Limit Reached')
                    .setDescription(`You have used all your ${pingType} pings for today. Your ping permissions will reset tomorrow.`);
                
                await message.channel.send({ embeds: [warningEmbed] });
            }
            saveSlots();
            
            // Log ping usage
            addSlotLog('Ping-Used', `User ${message.author.tag} used ${pingType} ping in ${slot.slotName} (${slot.pingCounts[pingType]}/${slot.pingConfig[pingType]})`, slot);
        } else {
            // User has no remaining pings for this type
            await message.reply(`You have already used all your ${pingType} pings for today.`);
        }
    }
}

// Prefix command handler
client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // Handle sticky messages
    const sticky = stickyMessages[message.channel.id];
    if (sticky) {
        try {
            const oldMessage = await message.channel.messages.fetch(sticky.messageId);
            await oldMessage.delete();
            const newMessage = await message.channel.send(sticky.content);
            stickyMessages[message.channel.id].messageId = newMessage.id;
            saveSticky();
        } catch (error) {
            console.error('Error maintaining sticky message:', error);
            const newMessage = await message.channel.send(sticky.content);
            stickyMessages[message.channel.id].messageId = newMessage.id;
            saveSticky();
        }
    }

    // Slot ping handling
    const slot = slots.find(s => s.channelId === message.channel.id);
    if (slot) {
        await handleSlotPings(message, slot);
        return;
    }

    // Prefix command
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Check role permissions for new commands
    const newCommands = ['setpp', 'setpptos', 'paypal', 'setcrypto', 'setcryptotos', 'crypto', 'remind', 'rm', 'thx', 'sendreceipt', 'view', 'pull'];
    
    if (newCommands.includes(command)) {
        if (!hasAllowedRole(message.member)) {
            return message.reply('❌ You do not have permission to use this command. Required roles: 1377961200767336448, 1414227235728261170, 1377961208350507129, 1408125531869937825');
        }
    }

    // Check permissions for moderation commands
    const modCommands = ['ban', 'kick', 'timeout', 'untimeout', 'mute', 'unmute', 'warn', 'warnings', 'clearwarnings', 'removewarning', 'unban', 'nick', 'userinfo'];
    
    if (modCommands.includes(command)) {
        if (!hasModPermission(message.member)) {
            return message.reply('❌ You do not have permission to use moderation commands.');
        }
    }

    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) && !newCommands.includes(command) && !modCommands.includes(command)) {
        return message.reply('You do not have permission to use this command. Only Administrators can use bot commands.');
    }

    try {
        if (command === 'roleall') {
            const roleId = args[0]?.match(/\d+/)?.[0];
            if (!roleId) return message.reply('Please mention a role or provide a role ID.');

            const role = message.guild.roles.cache.get(roleId);
            if (!role) return message.reply('Role not found.');

            if (role.position >= message.guild.members.me.roles.highest.position) {
                return message.reply("I can't manage that role because it's higher than or equal to my highest role.");
            }

            const loadingMsg = await message.reply(`Adding role to all members... This may take a while.`);

            try {
                const members = await message.guild.members.fetch();
                let successCount = 0;
                let failCount = 0;

                for (const member of members.values()) {
                    try {
                        if (!member.roles.cache.has(role.id)) {
                            await member.roles.add(role);
                            successCount++;
                        }
                    } catch (error) {
                        console.error(`Failed to add role to ${member.user.tag}:`, error);
                        failCount++;
                    }
                }

                await loadingMsg.edit(`Successfully added the role to ${successCount} members. Failed to add to ${failCount} members.`);
            } catch (error) {
                console.error('Error fetching members:', error);
                await loadingMsg.edit('An error occurred while processing members.');
            }
        }
        else if (command === 'embed') {
            const title = args.join(' ');
            const description = args.join(' ');
            if (!title) {
                return message.reply('Please provide a title for the embed.');
            }
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description || ' ')
                .setColor('#0099ff')
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });
            await message.delete().catch(() => {});
        }
        else if (command === 'tos') {
            try {
                const tosMessage = createTosEmbed();
                const sentMessage = await message.channel.send(tosMessage);
                await message.delete().catch(() => {});
            } catch (error) {
                console.error('Error handling =tos command:', error);
                await message.reply('Failed to post ToS message.').catch(() => {});
            }
        }
        else if (command === 'stick') {
            const messageContent = args.join(' ');
            const channel = message.channel;
            if (!messageContent) {
                return message.reply('Please provide a message to stick.');
            }
            if (stickyMessages[channel.id]) {
                try {
                    const oldMessage = await channel.messages.fetch(stickyMessages[channel.id].messageId);
                    await oldMessage.delete();
                } catch (error) {
                    console.error('Error deleting old sticky message:', error);
                }
            }
            const newMessage = await channel.send(messageContent);
            stickyMessages[channel.id] = {
                messageId: newMessage.id,
                content: messageContent
            };
            saveSticky();
            await message.reply('Message has been stuck to the top of this channel!');
            await message.delete().catch(() => {});
        }
        else if (command === 'unstick') {
            const channel = message.channel;
            if (!stickyMessages[channel.id]) {
                return message.reply('There is no sticky message in this channel!');
            }
            try {
                const oldMessage = await channel.messages.fetch(stickyMessages[channel.id].messageId);
                await oldMessage.delete();
            } catch (error) {
                console.error('Error deleting sticky message:', error);
            }
            delete stickyMessages[channel.id];
            saveSticky();
            await message.reply('Sticky message has been removed from this channel!');
            await message.delete().catch(() => {});
        }
        else if (command === 'categorybroadcast') {
            const categoryId = args[0];
            const broadcastMessage = args.slice(1).join(' ');
            if (!categoryId || !broadcastMessage) {
                return message.reply('Usage: `=categorybroadcast <categoryID> <message>`');
            }
            const category = message.guild.channels.cache.get(categoryId);
            if (!category || category.type !== 4) {
                return message.reply('Please provide a valid category ID.');
            }
            const loadingMsg = await message.reply(`Broadcasting message to all channels in category "${category.name}"...`);
            try {
                const channels = message.guild.channels.cache.filter(
                    channel => channel.parentId === category.id && channel.type === 0
                );
                if (channels.size === 0) {
                    return loadingMsg.edit('No text channels found in this category!');
                }
                let successCount = 0;
                let failCount = 0;
                for (const [_, channel] of channels) {
                    try {
                        await channel.send(broadcastMessage);
                        successCount++;
                    } catch (error) {
                        console.error(`Failed to send message to ${channel.name}:`, error);
                        failCount++;
                    }
                }
                await loadingMsg.edit(`Message sent to ${successCount} channels in the category "${category.name}". Failed to send to ${failCount} channels.`);
            } catch (error) {
                console.error('Error broadcasting to category channels:', error);
                await loadingMsg.edit('An error occurred while broadcasting the message.');
            }
        }
        else if (command === 'staffping') {
            const embed = new EmbedBuilder()
                .setTitle('⚠️ Staff Ping Reminder')
                .setDescription('Please Avoid Pinging Staff!')
                .addFields(
                    { name: '\u200B', value: 'Pinging Staff will NOT make them look at your Ticket faster, and could actually delay their response.' },
                    { name: '\u200B', value: 'Staff will respond to tickets in the order they are received. Please be patient!' }
                )
                .setColor(0xFFA500)
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });
            await message.delete().catch(() => {});
        }
        else if (command === 'notify') {
            const userMention = args[0];
            if (!userMention) {
                return message.reply('Please mention a user to notify. Usage: `=notify @user`');
            }

            const userId = userMention.match(/\d+/)?.[0];
            if (!userId) {
                return message.reply('Please provide a valid user mention. Usage: `=notify @user`');
            }

            try {
                const user = await client.users.fetch(userId);
                const currentChannel = message.channel;
                
                // Send DM to the user with channel link
                await user.send(`You are Needed in DragonSky! Please go check <#${currentChannel.id}>.`);
                
                await message.reply(`✅ Notification sent to ${user.tag}! They were directed to this channel.`);
                await message.delete().catch(() => {});
                
                console.log(`Notification sent to ${user.tag} by ${message.author.tag} - Redirected to channel: ${currentChannel.name}`);
            } catch (error) {
                console.error('Error sending notification:', error);
                await message.reply(`❌ Failed to send notification. The user may have DMs disabled or doesn't exist.`);
            }
        }
        else if (command === 'help') {
            const page = args[0] ? parseInt(args[0]) : 1;
            const validPage = Math.max(1, Math.min(4, page || 1));
            
            const helpEmbed = createHelpEmbed(validPage);
            const helpMessage = await message.channel.send({ embeds: helpEmbed.embeds, components: helpEmbed.components });
            
            // Delete the command message
            await message.delete().catch(() => {});
            
            // Set up button collector for prefix command
            const filter = (i) => i.customId.startsWith('help_') && i.user.id === message.author.id;
            const collector = helpMessage.createMessageComponentCollector({ filter, time: 60000 });
            
            collector.on('collect', async (i) => {
                await handleHelpInteraction(i);
            });
            
            collector.on('end', () => {
                helpMessage.edit({ components: [] }).catch(() => {});
            });
        }

        // MODERATION PREFIX COMMANDS
        else if (command === 'ban') {
            const userMention = args[0];
            const reason = args.slice(1).join(' ') || 'No reason provided';

            if (!userMention) {
                return message.reply('Usage: `=ban @user [reason]`');
            }

            const userId = userMention.match(/\d+/)?.[0];
            if (!userId) {
                return message.reply('Please provide a valid user mention.');
            }

            if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)) {
                return message.reply('❌ I do not have permission to ban members.');
            }

            const user = await client.users.fetch(userId).catch(() => null);
            if (!user) {
                return message.reply('❌ User not found.');
            }

            const member = await message.guild.members.fetch(userId).catch(() => null);
            
            if (!member) {
                return message.reply('❌ User not found in this server.');
            }

            if (!member.bannable) {
                return message.reply('❌ I cannot ban this user. They may have a higher role than me.');
            }

            try {
                await member.ban({ reason: `${reason} - Banned by ${message.author.tag}` });
                
                const embed = createModLogEmbed('ban', user, message.author, reason);
                await sendModLog(embed);
                
                await message.reply(`✅ Successfully banned ${user.tag}.`);
                await message.delete().catch(() => {});
            } catch (error) {
                console.error('Error banning user:', error);
                await message.reply('❌ Failed to ban user.');
            }
        }
        else if (command === 'kick') {
            const userMention = args[0];
            const reason = args.slice(1).join(' ') || 'No reason provided';

            if (!userMention) {
                return message.reply('Usage: `=kick @user [reason]`');
            }

            const userId = userMention.match(/\d+/)?.[0];
            if (!userId) {
                return message.reply('Please provide a valid user mention.');
            }

            if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.KickMembers)) {
                return message.reply('❌ I do not have permission to kick members.');
            }

            const user = await client.users.fetch(userId).catch(() => null);
            if (!user) {
                return message.reply('❌ User not found.');
            }

            const member = await message.guild.members.fetch(userId).catch(() => null);
            
            if (!member) {
                return message.reply('❌ User not found in this server.');
            }

            if (!member.kickable) {
                return message.reply('❌ I cannot kick this user. They may have a higher role than me.');
            }

            try {
                await member.kick(`${reason} - Kicked by ${message.author.tag}`);
                
                const embed = createModLogEmbed('kick', user, message.author, reason);
                await sendModLog(embed);
                
                await message.reply(`✅ Successfully kicked ${user.tag}.`);
                await message.delete().catch(() => {});
            } catch (error) {
                console.error('Error kicking user:', error);
                await message.reply('❌ Failed to kick user.');
            }
        }
        else if (command === 'timeout') {
            const userMention = args[0];
            const durationStr = args[1];
            const reason = args.slice(2).join(' ') || 'No reason provided';

            if (!userMention || !durationStr) {
                return message.reply('Usage: `=timeout @user 1h [reason]`');
            }

            const userId = userMention.match(/\d+/)?.[0];
            if (!userId) {
                return message.reply('Please provide a valid user mention.');
            }

            if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
                return message.reply('❌ I do not have permission to timeout members.');
            }

            const duration = parseTime(durationStr);
            if (!duration) {
                return message.reply('❌ Invalid duration format. Use: 1h (1 hour), 30m (30 minutes), 2d (2 days)');
            }

            if (duration > 28 * 24 * 60 * 60 * 1000) {
                return message.reply('❌ Timeout duration cannot exceed 28 days.');
            }

            const user = await client.users.fetch(userId).catch(() => null);
            if (!user) {
                return message.reply('❌ User not found.');
            }

            const member = await message.guild.members.fetch(userId).catch(() => null);
            
            if (!member) {
                return message.reply('❌ User not found in this server.');
            }

            if (!member.moderatable) {
                return message.reply('❌ I cannot timeout this user. They may have a higher role than me.');
            }

            try {
                await member.timeout(duration, `${reason} - Timed out by ${message.author.tag}`);
                
                const embed = createModLogEmbed('timeout', user, message.author, reason, duration);
                await sendModLog(embed);
                
                await message.reply(`✅ Successfully timed out ${user.tag} for ${formatDuration(duration)}.`);
                await message.delete().catch(() => {});
            } catch (error) {
                console.error('Error timing out user:', error);
                await message.reply('❌ Failed to timeout user.');
            }
        }
        else if (command === 'untimeout') {
            const userMention = args[0];
            const reason = args.slice(1).join(' ') || 'No reason provided';

            if (!userMention) {
                return message.reply('Usage: `=untimeout @user [reason]`');
            }

            const userId = userMention.match(/\d+/)?.[0];
            if (!userId) {
                return message.reply('Please provide a valid user mention.');
            }

            if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
                return message.reply('❌ I do not have permission to remove timeouts.');
            }

            const user = await client.users.fetch(userId).catch(() => null);
            if (!user) {
                return message.reply('❌ User not found.');
            }

            const member = await message.guild.members.fetch(userId).catch(() => null);
            
            if (!member) {
                return message.reply('❌ User not found in this server.');
            }

            if (!member.moderatable) {
                return message.reply('❌ I cannot modify this user\'s timeout. They may have a higher role than me.');
            }

            if (!member.isCommunicationDisabled()) {
                return message.reply('❌ This user is not timed out.');
            }

            try {
                await member.timeout(null, `${reason} - Timeout removed by ${message.author.tag}`);
                
                const embed = createModLogEmbed('untimeout', user, message.author, reason);
                await sendModLog(embed);
                
                await message.reply(`✅ Successfully removed timeout from ${user.tag}.`);
                await message.delete().catch(() => {});
            } catch (error) {
                console.error('Error removing timeout:', error);
                await message.reply('❌ Failed to remove timeout.');
            }
        }
        else if (command === 'warn') {
            const userMention = args[0];
            const reason = args.slice(1).join(' ') || 'No reason provided';

            if (!userMention) {
                return message.reply('Usage: `=warn @user [reason]`');
            }

            const userId = userMention.match(/\d+/)?.[0];
            if (!userId) {
                return message.reply('Please provide a valid user mention.');
            }

            const user = await client.users.fetch(userId).catch(() => null);
            if (!user) {
                return message.reply('❌ User not found.');
            }

            const warning = addWarning(userId, message.author.id, reason);
            const userWarnings = getUserWarnings(userId);

            const embed = createModLogEmbed('warn', user, message.author, reason);
            await sendModLog(embed);

            await message.reply(`✅ Warned ${user.tag}. They now have ${userWarnings.length} warning(s).\n**Reason:** ${reason}\n**Warning ID:** ${warning.id}`);
            await message.delete().catch(() => {});
        }
        else if (command === 'warnings') {
            const userMention = args[0];

            if (!userMention) {
                return message.reply('Usage: `=warnings @user`');
            }

            const userId = userMention.match(/\d+/)?.[0];
            if (!userId) {
                return message.reply('Please provide a valid user mention.');
            }

            const user = await client.users.fetch(userId).catch(() => null);
            if (!user) {
                return message.reply('❌ User not found.');
            }

            const userWarnings = getUserWarnings(userId);

            if (userWarnings.length === 0) {
                return message.reply(`✅ ${user.tag} has no warnings.`);
            }

            const warningsList = userWarnings.map(warning => 
                `**ID:** ${warning.id} | **Date:** ${new Date(warning.timestamp).toLocaleDateString()}\n**Reason:** ${warning.reason}\n**By:** <@${warning.moderatorId}>\n`
            ).join('\n');

            const embed = new EmbedBuilder()
                .setColor(0xFEE75C)
                .setTitle(`⚠️ Warnings for ${user.tag}`)
                .setDescription(warningsList)
                .setFooter({ text: `Total warnings: ${userWarnings.length}` })
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });
            await message.delete().catch(() => {});
        }
        else if (command === 'clearwarnings') {
            const userMention = args[0];

            if (!userMention) {
                return message.reply('Usage: `=clearwarnings @user`');
            }

            const userId = userMention.match(/\d+/)?.[0];
            if (!userId) {
                return message.reply('Please provide a valid user mention.');
            }

            const user = await client.users.fetch(userId).catch(() => null);
            if (!user) {
                return message.reply('❌ User not found.');
            }

            const userWarnings = getUserWarnings(userId);

            if (userWarnings.length === 0) {
                return message.reply(`✅ ${user.tag} has no warnings to clear.`);
            }

            const cleared = clearWarnings(userId);
            
            if (cleared) {
                await message.reply(`✅ Cleared all warnings for ${user.tag}.`);
                await message.delete().catch(() => {});
            } else {
                await message.reply('❌ Failed to clear warnings.');
            }
        }
        else if (command === 'userinfo') {
            const userMention = args[0] || message.author.id;
            const userId = userMention.match(/\d+/)?.[0] || message.author.id;

            const user = await client.users.fetch(userId).catch(() => null);
            if (!user) {
                return message.reply('❌ User not found.');
            }

            const member = await message.guild.members.fetch(userId).catch(() => null);

            if (!member) {
                return message.reply('❌ User not found in this server.');
            }

            const embed = new EmbedBuilder()
                .setColor(member.displayHexColor || 0x0099FF)
                .setTitle(`👤 User Info - ${user.tag}`)
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: 'ID', value: user.id, inline: true },
                    { name: 'Username', value: user.username, inline: true },
                    { name: 'Discriminator', value: user.discriminator, inline: true },
                    { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
                    { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                    { name: 'Nickname', value: member.nickname || 'None', inline: true },
                    { name: 'Roles', value: member.roles.cache.size > 1 ? member.roles.cache.filter(role => role.id !== message.guild.id).map(role => role.toString()).join(', ') : 'None', inline: false },
                    { name: 'Highest Role', value: member.roles.highest.toString(), inline: true },
                    { name: 'Warnings', value: getUserWarnings(user.id).length.toString(), inline: true }
                )
                .setFooter({ text: `Requested by ${message.author.tag}` })
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });
            await message.delete().catch(() => {});
        }

        // NEW PREFIX COMMANDS
        else if (command === 'setpp') {
            const email = args[0];
            if (!email) {
                return message.reply('Usage: `=setpp your-email@example.com`');
            }

            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return message.reply('❌ Please provide a valid email address.');
            }

            const userId = message.author.id;

            if (!paypalData[userId]) {
                paypalData[userId] = {};
            }

            paypalData[userId].email = email;
            paypalData[userId].setBy = message.author.id;
            paypalData[userId].setAt = Date.now();

            savePayPal();

            await message.reply(`✅ Your PayPal email has been set to: \`${email}\``);
            await message.delete().catch(() => {});
        }
        else if (command === 'setpptos') {
            const userMention = args[0];
            if (!userMention) {
                return message.reply('Usage: `=setpptos @user`');
            }

            const userId = userMention.match(/\d+/)?.[0];
            if (!userId) {
                return message.reply('Please provide a valid user mention.');
            }

            if (!paypalData[userId]) {
                paypalData[userId] = {};
            }

            paypalData[userId].tosSetBy = message.author.id;
            paypalData[userId].tosSetAt = Date.now();

            savePayPal();

            await message.reply(`✅ PayPal TOS has been set for <@${userId}> by <@${message.author.id}>`);
            await message.delete().catch(() => {});
        }
        else if (command === 'paypal') {
            const userMention = args[0];
            if (!userMention) {
                return message.reply('Usage: `=paypal @user`');
            }

            const userId = userMention.match(/\d+/)?.[0];
            if (!userId) {
                return message.reply('Please provide a valid user mention.');
            }

            if (!paypalData[userId] || !paypalData[userId].email) {
                return message.reply(`❌ No PayPal information found for <@${userId}>`);
            }

            const paypalInfo = paypalData[userId];
            const tosUser = paypalInfo.tosSetBy || 'Not set';

            const paypalEmbed = createPayPalEmbed(userId, paypalInfo.email, tosUser);
            await message.channel.send(paypalEmbed);
            await message.delete().catch(() => {});
        }
        else if (command === 'setcrypto') {
            const cryptoType = args[0]?.toLowerCase();
            const address = args.slice(1).join(' ');

            if (!cryptoType || !address) {
                return message.reply('Usage: `=setcrypto btc your_wallet_address`');
            }

            const validTypes = ['btc', 'eth', 'ltc', 'bnb', 'usdt', 'usdc'];
            if (!validTypes.includes(cryptoType)) {
                return message.reply('❌ Invalid crypto type. Use: btc, eth, ltc, bnb, usdt, usdc');
            }

            const userId = message.author.id;

            if (!cryptoData[userId]) {
                cryptoData[userId] = {};
            }

            cryptoData[userId][cryptoType] = {
                address: address,
                setBy: message.author.id,
                setAt: Date.now()
            };

            saveCrypto();

            await message.reply(`✅ Your ${cryptoType.toUpperCase()} address has been set to: \`${address}\``);
            await message.delete().catch(() => {});
        }
        else if (command === 'setcryptotos') {
            const userMention = args[0];
            if (!userMention) {
                return message.reply('Usage: `=setcryptotos @user`');
            }

            const userId = userMention.match(/\d+/)?.[0];
            if (!userId) {
                return message.reply('Please provide a valid user mention.');
            }

            if (!cryptoData[userId]) {
                cryptoData[userId] = {};
            }

            // Set TOS for all crypto types for this user
            for (const cryptoType in cryptoData[userId]) {
                cryptoData[userId][cryptoType].tosSetBy = message.author.id;
                cryptoData[userId][cryptoType].tosSetAt = Date.now();
            }

            saveCrypto();

            await message.reply(`✅ Crypto TOS has been set for <@${userId}> by <@${message.author.id}>`);
            await message.delete().catch(() => {});
        }
        else if (command === 'crypto') {
            const userMention = args[0];
            const cryptoType = args[1]?.toLowerCase() || 'btc'; // Default to BTC
            
            if (!userMention) {
                return message.reply('Usage: `=crypto @user` or `=crypto @user btc`');
            }

            const userId = userMention.match(/\d+/)?.[0];
            if (!userId) {
                return message.reply('Please provide a valid user mention.');
            }

            if (!cryptoData[userId] || !cryptoData[userId][cryptoType]) {
                return message.reply(`❌ No ${cryptoType.toUpperCase()} information found for <@${userId}>`);
            }

            const cryptoInfo = cryptoData[userId][cryptoType];
            const cryptoEmbed = createCryptoEmbed(userId, cryptoType, cryptoInfo);
            await message.channel.send(cryptoEmbed);
            await message.delete().catch(() => {});
        }
        else if (command === 'remind' || command === 'rm') {
            const timeString = args[0];
            const reminderMessage = args.slice(1).join(' ');

            if (!timeString || !reminderMessage) {
                return message.reply('Usage: `=remind 1h Your reminder message`');
            }

            // Parse time string (e.g., 1h, 30m, 2d)
            const timeRegex = /^(\d+)([hmd])$/;
            const match = timeString.match(timeRegex);

            if (!match) {
                return message.reply('❌ Invalid time format. Use: 1h (1 hour), 30m (30 minutes), 2d (2 days)');
            }

            const value = parseInt(match[1]);
            const unit = match[2];

            let milliseconds;
            switch (unit) {
                case 'm': milliseconds = value * 60 * 1000; break;
                case 'h': milliseconds = value * 60 * 60 * 1000; break;
                case 'd': milliseconds = value * 24 * 60 * 60 * 1000; break;
                default: milliseconds = value * 60 * 1000;
            }

            const reminderTime = new Date(Date.now() + milliseconds);

            schedule.scheduleJob(reminderTime, async () => {
                try {
                    await message.author.send(`🔔 Reminder: ${reminderMessage}`);
                } catch (error) {
                    console.error('Failed to send reminder DM:', error);
                    // Try to send in the channel instead
                    await message.channel.send(`<@${message.author.id}> 🔔 Reminder: ${reminderMessage}`).catch(console.error);
                }
            });

            await message.reply(`✅ I'll remind you about "${reminderMessage}" in ${timeString}`);
            await message.delete().catch(() => {});
        }
        else if (command === 'thx') {
            await message.channel.send(':ah_love: Your order has been noted and you are in queue. Please stay patient and your order will be delivered soon!');
            await message.delete().catch(() => {});
        }

        // RECEIPT PREFIX COMMAND
        else if (command === 'sendreceipt') {
            const customerMention = args[0];
            const product = args.slice(1, -3).join(' ');
            const price = args[args.length - 3];
            const paymentMethod = args[args.length - 2];
            const seller = args[args.length - 1];

            if (!customerMention || !product || !price || !paymentMethod || !seller) {
                return message.reply('Usage: `=sendreceipt @customer "product name" price payment_method seller`');
            }

            const customerId = customerMention.match(/\d+/)?.[0];
            if (!customerId) {
                return message.reply('Please provide a valid customer mention.');
            }

            const customer = await client.users.fetch(customerId).catch(() => null);
            if (!customer) {
                return message.reply('Customer not found.');
            }

            // Store receipt data
            const receiptId = generateTransactionId();
            receipts[receiptId] = {
                customerId: customer.id,
                product: product,
                price: price,
                paymentMethod: paymentMethod,
                seller: seller,
                timestamp: Date.now(),
                transactionId: receiptId
            };
            saveReceipts();

            // Send receipt message
            const receiptMessage = createReceiptMessage(product, price, seller);
            await message.channel.send({ 
                content: `<@${customer.id}>`, 
                ...receiptMessage 
            });
            await message.delete().catch(() => {});
        }

        // VIEW TRANSCRIPT PREFIX COMMAND
        else if (command === 'view') {
            const ticketIdentifier = args[0];
            if (!ticketIdentifier) {
                return message.reply('Usage: `=view #channel` or `=view ticket-id`');
            }
            
            await handleViewTranscript(message, ticketIdentifier);
            await message.delete().catch(() => {});
        }

        // PULL PREFIX COMMAND
        else if (command === 'pull') {
            const ticketIdentifier = args[0];
            if (!ticketIdentifier) {
                // If no ticket ID provided, show quick help
                return handleQuickPull(message);
            }
            await handlePullCommand(message, ticketIdentifier);
            await message.delete().catch(() => {});
        }

    } catch (error) {
        console.error(`Error handling prefix command ${command}:`, error);
        await message.reply('There was an error executing that command.');
    }
});

client.login(token);