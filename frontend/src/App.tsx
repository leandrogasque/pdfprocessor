import { useState, useEffect, useRef } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import * as pdfjsLib from 'pdfjs-dist';

// Configure o workerSrc para pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function App() {
  const [count, setCount] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setMessage('Carregando PDF...');
      setPdfDoc(null); // Reset previous doc
      setNumPages(0);

      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target?.result) {
          try {
            const typedArray = new Uint8Array(e.target.result as ArrayBuffer);
            const loadingTask = pdfjsLib.getDocument({ data: typedArray });
            const pdf = await loadingTask.promise;
            setPdfDoc(pdf);
            setNumPages(pdf.numPages);
            setMessage(`PDF carregado com ${pdf.numPages} páginas.`);
          } catch (error) {
            console.error('Erro ao carregar PDF:', error);
            setMessage('Erro ao carregar o arquivo PDF.');
            setSelectedFile(null);
          }
        }
      };
      reader.readAsArrayBuffer(file);

    } else {
      setSelectedFile(null);
      setPdfDoc(null);
      setNumPages(0);
      if (file) {
        setMessage('Por favor, selecione um arquivo PDF válido.');
      } else {
        setMessage('');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Por favor, selecione um arquivo PDF.');
      return;
    }
    if (selectedPages.size === 0) {
      setMessage('Por favor, selecione pelo menos uma página.');
      return;
    }

    const formData = new FormData();
    formData.append('pdfFile', selectedFile);
    // Send selected pages as a comma-separated string or JSON array
    formData.append('selectedPages', JSON.stringify(Array.from(selectedPages).sort((a, b) => a - b)));

    try {
      // Adjust the URL to your backend endpoint if necessary
      const response = await fetch('http://localhost:3001/process-pdf', { // Changed endpoint
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`Processamento iniciado: ${result.message}`);
        console.log('Backend response:', result);
        // Optionally clear the file input and state after successful processing
        setSelectedFile(null);
        setPdfDoc(null);
        setNumPages(0);
        setCurrentPage(1);
        setSelectedPages(new Set());
        setMessage('');
        const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      } else {
        setMessage(`Erro no processamento: ${result.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Erro ao processar PDF:', error);
      setMessage('Erro ao conectar com o servidor para processamento.');
    }
  };

  // Effect to render the current page
  useEffect(() => {
    if (pdfDoc && canvasRef.current) {
      const renderPage = async () => {
        try {
          const page = await pdfDoc.getPage(currentPage);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = canvasRef.current!;
          const context = canvas.getContext('2d')!;
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };
          await page.render(renderContext).promise;
        } catch (error) {
          console.error('Erro ao renderizar página:', error);
          setMessage('Erro ao renderizar a página do PDF.');
        }
      };
      renderPage();
    }
  }, [pdfDoc, currentPage]);

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(numPages, prev + 1));
  };

  const handleSelectPage = (pageNumber: number) => {
    setSelectedPages((prevSelected) => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(pageNumber)) {
        newSelected.delete(pageNumber);
      } else {
        newSelected.add(pageNumber);
      }
      return newSelected;
    });
  };

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

      {/* PDF Upload Section */}
      <div className="card">
        <h2>Upload e Seleção de Páginas PDF</h2>
        <input
          type="file"
          id="pdf-upload"
          accept=".pdf" // Accept only PDF files
          onChange={handleFileChange}
        />
        {message && <p>{message}</p>}
      </div>

      {/* PDF Viewer and Selection Section */}
      {pdfDoc && (
        <div className="card">
          <h3>Visualizador de PDF</h3>
          <div>
            <button onClick={goToPreviousPage} disabled={currentPage <= 1}>
              Anterior
            </button>
            <span>
              Página {currentPage} de {numPages}
            </span>
            <button onClick={goToNextPage} disabled={currentPage >= numPages}>
              Próxima
            </button>
          </div>
          <div style={{ marginTop: '10px', marginBottom: '10px' }}>
             <input
               type="checkbox"
               id={`page-${currentPage}`}
               checked={selectedPages.has(currentPage)}
               onChange={() => handleSelectPage(currentPage)}
             />
             <label htmlFor={`page-${currentPage}`}> Selecionar Página {currentPage}</label>
          </div>
          <canvas ref={canvasRef} style={{ border: '1px solid black', maxWidth: '100%' }} />
          <div>
            <p>Páginas selecionadas: {Array.from(selectedPages).sort((a, b) => a - b).join(', ') || 'Nenhuma'}</p>
            <button onClick={handleUpload} disabled={selectedPages.size === 0}>
              Processar Páginas Selecionadas
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
