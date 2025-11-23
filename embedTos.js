const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

function createTosEmbed() {
    try {
        const embed = new EmbedBuilder()
            .setTitle('DarkDragon - Terms of Service')
            .setDescription('By proceeding, you acknowledge and agree to these terms below. Click the button to access each terms section.')
            .setColor('#0099ff');

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('server_terms')
                    .setLabel('Server Terms')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('slot_terms')
                    .setLabel('Slot Terms')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('service_terms')
                    .setLabel('Service Terms')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('marketing_terms')
                    .setLabel('Marketing Terms')
                    .setStyle(ButtonStyle.Primary)
            );

        return { embeds: [embed], components: [row] };
    } catch (error) {
        console.error('Error creating ToS embed:', error);
        throw error;
    }
}

async function handleTosInteraction(interaction) {
    try {
        // Defer the reply first to prevent interaction timeout
        await interaction.deferReply({ ephemeral: true });

        let termsContent = '';
        let title = '';

        switch (interaction.customId) {
            case 'server_terms':
                title = 'Server Terms';
                termsContent = `
**1. Server Rules**
- No harassment, hate speech, or discrimination of any kind
- No NSFW or explicit content
- No spamming or excessive caps
- No advertising without permission
- No malicious links or files

**2. Moderation**
- Staff decisions are final
- Evading punishments will result in escalation
- Follow Discord's Terms of Service and Community Guidelines

**3. Channels**
- Keep discussions in appropriate channels
- Don't disrupt conversations with off-topic messages
- Voice chat rules apply the same as text channels
                `;
                break;

            case 'slot_terms':
                title = 'Slot Terms';
                termsContent = `
**1. Slot Ownership**
- Slots are leased for the duration purchased
- Slot owners must follow all server rules
- Slot permissions may be revoked for rule violations

**2. Ping Limits**
- Daily ping limits are strictly enforced
- Attempting to bypass limits will result in slot termination
- Limits reset at midnight server time

**3. Content Responsibility**
- Slot owners are responsible for content in their channels
- Illegal or prohibited content will result in immediate ban
- Staff reserve right to monitor all slot channels
                `;
                break;

            case 'service_terms':
                title = 'Service Terms';
                termsContent = `
**1. Payments**
- All sales are final
- No refunds except as required by law
- Chargebacks will result in permanent ban

**2. Availability**
- We strive for 24/7 uptime but don't guarantee it
- Scheduled maintenance will be announced when possible
- No compensation for downtime

**3. Changes**
- Terms may be updated at any time
- Continued use constitutes acceptance of changes
- Major changes will be announced in advance when possible
                `;
                break;

            case 'marketing_terms':
                title = 'Marketing Terms';
                termsContent = `
**1. Promotions**
- Must comply with Discord's promotional guidelines
- No false or misleading claims
- Must disclose any paid promotions

**2. Affiliates**
- Affiliate links must be disclosed
- Cannot claim official partnership without written consent
- Responsible for affiliate actions

**3. Intellectual Property**
- Cannot use server branding without permission
- Must respect all copyrights and trademarks
- User-generated content remains property of creators
                `;
                break;

            default:
                return await interaction.followUp({ content: 'Invalid terms selection.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(`${title} - Detailed Terms`)
            .setDescription(termsContent)
            .setColor('#0099ff')
            .setFooter({ text: 'Last Updated: ' + new Date().toLocaleDateString() });

        await interaction.followUp({ embeds: [embed], ephemeral: true });
    } catch (error) {
        console.error('Error handling ToS interaction:', error);
        try {
            await interaction.followUp({ 
                content: 'An error occurred while processing your request. Please try again later.', 
                ephemeral: true 
            });
        } catch (followUpError) {
            console.error('Failed to send follow-up error message:', followUpError);
        }
    }
}

module.exports = { createTosEmbed, handleTosInteraction };