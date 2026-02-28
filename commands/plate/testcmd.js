// import { SlashCommandBuilder } from "@discordjs/builders";
// import fs from "fs";
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// import path from "path";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// import { plateReminder } from "../../support/plate-code.js";

// // remindplate Command
// export const commandTitle = {
//     data: new SlashCommandBuilder()
//         .setName("testcmd")
//         .setDescription("test"),

//     run: async ({ client, interaction }) => {

//         try {

//             plateReminder(client);
//             await interaction.editReply({ content: "Test command executed", ephemeral: true });
//         } catch (error) {
//             console.error("Error executing command:", error);
//             await interaction.editReply({
//                 content: "An error occurred while executing the command.",
//                 ephemeral: true,
//             });
//         }
//     },
// };
