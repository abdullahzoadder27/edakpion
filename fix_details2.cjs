const fs = require('fs');
let content = fs.readFileSync('src/hooks/useProductDetails.ts', 'utf8');

const targetFallback = `      } catch (err: any) {
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

const replacementFallback = `      } catch (err: any) {
        // Silent catch for expected fallback
        setError(err.message);
        // Fallback
        
        // Find if it exists in mockProducts list to get real name and image
        import('../data').then((module) => {
          const mockItem = module.products.find(p => p.id === id);
          if (mockItem) {
             setProduct({
               ...mockProductDetails['1'],
               id: mockItem.id,
               name: mockItem.name,
               price: mockItem.price,
               originalPrice: mockItem.price + 200,
               imageUrl: mockItem.imageUrl,
               images: [mockItem.imageUrl, mockItem.imageUrl, mockItem.imageUrl]
             });
          } else {
             setProduct(mockProductDetails[id] || {
               ...mockProductDetails['1'],
               id,
               name: 'Generic Product ' + id
             });
          }
        }).catch(() => {
          setProduct(mockProductDetails[id] || {
            ...mockProductDetails['1'],
            id,
            name: 'Generic Product ' + id
          });
        });

        setReviews(mockReviews);
      } finally {`;

content = content.replace(targetFallback, replacementFallback);

const targetImport = `import { ProductDetail, Review } from '../types';`;
const replaceImport = `import { ProductDetail, Review } from '../types';
import { products as mockProductsList } from '../data';`;
content = content.replace(targetImport, replaceImport);

const replacementFallbackSync = `      } catch (err: any) {
        // Silent catch for expected fallback
        setError(err.message);
        // Fallback
        
        const mockItem = mockProductsList.find(p => p.id === id);
        if (mockItem) {
           setProduct({
             ...mockProductDetails['1'],
             id: mockItem.id,
             name: mockItem.name,
             price: mockItem.price,
             originalPrice: mockItem.price + 200,
             imageUrl: mockItem.imageUrl,
             images: [mockItem.imageUrl, mockItem.imageUrl, mockItem.imageUrl]
           });
        } else {
           setProduct(mockProductDetails[id] || {
             ...mockProductDetails['1'],
             id,
             name: 'Generic Product ' + id
           });
        }
        
        setReviews(mockReviews);
      } finally {`;
      
content = content.replace(replacementFallback, replacementFallbackSync);

const initialFallbackTarget = `        setTimeout(() => {
          setProduct(mockProductDetails[id] || {
            ...mockProductDetails['1'],
            id,
            name: 'Generic Product ' + id
          });
          setReviews(mockReviews);
          setLoading(false);
        }, 500);`;
        
const initialFallbackReplacement = `        setTimeout(() => {
          const mockItem = mockProductsList.find(p => p.id === id);
          if (mockItem) {
             setProduct({
               ...mockProductDetails['1'],
               id: mockItem.id,
               name: mockItem.name,
               price: mockItem.price,
               originalPrice: mockItem.price + 200,
               imageUrl: mockItem.imageUrl,
               images: [mockItem.imageUrl, mockItem.imageUrl, mockItem.imageUrl]
             });
          } else {
             setProduct(mockProductDetails[id] || {
               ...mockProductDetails['1'],
               id,
               name: 'Generic Product ' + id
             });
          }
          setReviews(mockReviews);
          setLoading(false);
        }, 500);`;
content = content.replace(initialFallbackTarget, initialFallbackReplacement);
fs.writeFileSync('src/hooks/useProductDetails.ts', content);
