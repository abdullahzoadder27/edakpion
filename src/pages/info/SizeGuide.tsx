import { Helmet } from 'react-helmet-async';

export default function SizeGuide() {
  return (
    <div className="w-full">
      <Helmet>
        <title>Size Guide | EDAKPION</title>
        <meta name="description" content="Find your perfect fit with the EDAKPION clothing size guide." />
      </Helmet>
      
      
      <div className="pt-8 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif text-[#0F3D2E] mb-6 tracking-tight">Size Guide</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Use the charts below to determine your perfect fit. All measurements are provided in inches.
            </p>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm mb-12">
            <h2 className="text-2xl font-bold text-[#0F3D2E] mb-6">T-Shirts & Tops</h2>
            <div className="overflow-x-auto mb-10">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="py-4 px-6 font-semibold text-[#0F3D2E]">Size</th>
                    <th className="py-4 px-6 font-semibold text-[#0F3D2E]">Chest (inches)</th>
                    <th className="py-4 px-6 font-semibold text-[#0F3D2E]">Length (inches)</th>
                    <th className="py-4 px-6 font-semibold text-[#0F3D2E]">Shoulder (inches)</th>
                    <th className="py-4 px-6 font-semibold text-[#0F3D2E]">Sleeve (inches)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium">S</td>
                    <td className="py-4 px-6 text-gray-600">38</td>
                    <td className="py-4 px-6 text-gray-600">27</td>
                    <td className="py-4 px-6 text-gray-600">17</td>
                    <td className="py-4 px-6 text-gray-600">8</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium">M</td>
                    <td className="py-4 px-6 text-gray-600">40</td>
                    <td className="py-4 px-6 text-gray-600">28</td>
                    <td className="py-4 px-6 text-gray-600">18</td>
                    <td className="py-4 px-6 text-gray-600">8.5</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium">L</td>
                    <td className="py-4 px-6 text-gray-600">42</td>
                    <td className="py-4 px-6 text-gray-600">29</td>
                    <td className="py-4 px-6 text-gray-600">19</td>
                    <td className="py-4 px-6 text-gray-600">9</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium">XL</td>
                    <td className="py-4 px-6 text-gray-600">44</td>
                    <td className="py-4 px-6 text-gray-600">30</td>
                    <td className="py-4 px-6 text-gray-600">20</td>
                    <td className="py-4 px-6 text-gray-600">9.5</td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium">XXL</td>
                    <td className="py-4 px-6 text-gray-600">46</td>
                    <td className="py-4 px-6 text-gray-600">31</td>
                    <td className="py-4 px-6 text-gray-600">21</td>
                    <td className="py-4 px-6 text-gray-600">10</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="text-2xl font-bold text-[#0F3D2E] mb-6">How to Measure</h2>
            <div className="grid md:grid-cols-2 gap-8 text-gray-600">
              <div>
                <h4 className="font-bold text-[#0F3D2E] mb-2">Chest</h4>
                <p className="mb-6">Measure across the garment, 1 inch below the armhole, from seam to seam.</p>
                
                <h4 className="font-bold text-[#0F3D2E] mb-2">Length</h4>
                <p>Measure from the highest point of the shoulder down to the bottom hem.</p>
              </div>
              <div>
                <h4 className="font-bold text-[#0F3D2E] mb-2">Shoulder</h4>
                <p className="mb-6">Measure straight across from shoulder seam to shoulder seam.</p>
                
                <h4 className="font-bold text-[#0F3D2E] mb-2">Sleeve</h4>
                <p>Measure from the shoulder seam down to the edge of the sleeve.</p>
              </div>
            </div>

            <div className="mt-10 bg-blue-50 p-6 rounded-xl border border-blue-100">
              <h4 className="font-bold text-blue-900 mb-2">A Note on Oversized Fits</h4>
              <p className="text-blue-800/80 text-sm">
                Our "Oversized" products are designed to have a relaxed, roomy fit. If you prefer a standard, more tailored fit, we recommend sizing down one size from your usual choice.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
