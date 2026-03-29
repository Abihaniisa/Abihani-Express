const fs = require('fs');

const envContent = `// AUTO-GENERATED at build time — do not edit or commit
const ENV = {
    SUPABASE_URL: '${process.env.SUPABASE_URL || ''}',
    SUPABASE_ANON_KEY: '${process.env.SUPABASE_ANON_KEY || ''}',
    WHATSAPP_NUMBER: '${process.env.WHATSAPP_NUMBER || '+2347067551684'}',
    ADMIN_EMAIL: '${process.env.ADMIN_EMAIL || ''}',
};
`;

fs.writeFileSync('js/env.js', envContent);
console.log('js/env.js generated from environment variables');
