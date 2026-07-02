const fs = require('fs');
let content = fs.readFileSync('src/hooks/useProductDetails.ts', 'utf8');

const targetFallback = `      } catch (err: any) {
        // Silent catch for expected fallback
        setError(err.message);
        // Fallback
        setProduct(mockProductDetails[id] || mockProductDetails['1']);
        setReviews(mockReviews);
      } finally {`;

const replacementFallback = `      } catch (err: any) {
        // Silent catch for expected fallback
        setError(err.message);
        // Fallback
        setProduct(mockProductDetails[id] || {
          ...mockProductDetails['1'],
          id,
          name: 'Generic Product ' + id
        });
        setReviews(mockReviews);
      } finally {`;

content = content.replace(targetFallback, replacementFallback);

fs.writeFileSync('src/hooks/useProductDetails.ts', content);
