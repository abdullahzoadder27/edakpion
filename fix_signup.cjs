const fs = require('fs');
let file = 'src/pages/Signup.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  "} catch (err: any) {\n      setError(err.message || 'Failed to sign up');\n    } finally {",
  "} catch (err: any) {\n      if (err.message === 'Failed to fetch') {\n        setError('Connection failed. Your Supabase project might be paused or the URL is invalid. Please check your Supabase credentials in Settings.');\n      } else {\n        setError(err.message || 'Failed to sign up');\n      }\n    } finally {"
);
fs.writeFileSync(file, content);
