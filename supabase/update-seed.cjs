const fs = require('fs');
let sql = fs.readFileSync('supabase/seed-official-candidates.sql', 'utf8');

// Fix typo first
sql = sql.replace("'JHON DALE M. CARIN'", "'JOHN DALE M. CARIN'");

sql = sql.replace('partylist VARCHAR(100) NOT NULL,', 'partylist VARCHAR(100) NOT NULL,\n  image_url TEXT,');
sql = sql.replace('bio, sort_order', 'bio, image_url, sort_order');

sql = sql.replace(/\((('[^']+', ){5})(\d+)\)/g, (match, p1, p2, p3) => {
  const parts = match.substring(1, match.length - 1).split(', ');
  const fullName = parts[1].replace(/'/g, '').trim();
  const num = parts[5];
  return `(${parts[0]}, ${parts[1]}, ${parts[2]}, ${parts[3]}, ${parts[4]}, '/CANDIDATES/${fullName}.png', ${num})`;
});

sql = sql.replace('bio = o.bio', 'bio = o.bio,\n  image_url = o.image_url');
sql = sql.replace('tagline, bio)', 'tagline, bio, image_url)');
sql = sql.replace('o.tagline, o.bio', 'o.tagline, o.bio, o.image_url');

fs.writeFileSync('supabase/seed-official-candidates.sql', sql);
