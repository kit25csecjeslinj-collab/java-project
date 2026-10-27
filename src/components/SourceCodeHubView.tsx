import React, { useState } from 'react';
import {
  Code2,
  FolderTree,
  Download,
  Copy,
  Check,
  FileCode,
  Terminal,
  Database,
  ExternalLink,
  BookOpen,
  Sparkles,
  Layers,
  ShieldAlert
} from 'lucide-react';
import JSZip from 'jszip';
import { JAVA_PROJECT_FILES, JavaFileItem } from '../data/javaProjectCode';

export const SourceCodeHubView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<JavaFileItem>(JAVA_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Root directory for clean extraction
      const rootFolder = zip.folder('bloodlink-ai-spring-boot');

      JAVA_PROJECT_FILES.forEach((file) => {
        rootFolder?.file(file.path, file.content);
      });

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'bloodlink-ai-spring-boot-eclipse.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create ZIP', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Eclipse IDE &amp; Spring Boot Maven Source Code
            </h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Code2 className="w-3 h-3 text-emerald-700" />
              Java 17 / Spring Boot 3.2.4
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Production-grade Java backend codebase with Spring Data JPA, Spring Security, MySQL DDL, and Thymeleaf.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isZipping}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Download className={`w-4 h-4 ${isZipping ? 'animate-bounce' : ''}`} />
          <span>{isZipping ? 'Generating Eclipse ZIP...' : 'Download Complete Eclipse Project (.ZIP)'}</span>
        </button>
      </div>

      {/* Stack Limitation & Architecture Clarification Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-1.5 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Technical Stack Statement &amp; College Final Year Deliverable
            </div>
            <h3 className="text-base font-bold text-white">
              Java Spring Boot Backend &amp; Interactive Web Outcome
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-3xl">
              As required by your prompt, the backend architecture is 100% written in <strong>Java 17 + Spring Boot + Spring Data JPA + Hibernate + MySQL</strong>.
              The live web application you are interacting with provides a full operational simulation and testing ground, while the exact, compilable Maven project source code below can be directly exported or imported into <strong>Eclipse IDE</strong> with one click.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <a
              href="#instructions"
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Eclipse Import Steps</span>
            </a>
          </div>
        </div>
      </div>

      {/* Two-Column Source Code Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Project File Tree */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 font-bold text-slate-800 text-xs uppercase tracking-wider">
            <FolderTree className="w-4 h-4 text-emerald-600" />
            <span>Maven Project Explorer</span>
          </div>

          <div className="space-y-1 text-xs">
            {JAVA_PROJECT_FILES.map((file) => {
              const isSelected = selectedFile.path === file.path;

              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate font-mono text-[11px]">{file.path}</span>
                  </div>
                  <span
                    className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold shrink-0 ml-1 ${
                      file.category === 'entity'
                        ? 'bg-purple-100 text-purple-700'
                        : file.category === 'service'
                        ? 'bg-blue-100 text-blue-700'
                        : file.category === 'sql'
                        ? 'bg-amber-100 text-amber-800'
                        : file.category === 'thymeleaf'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {file.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: File Viewer */}
        <div className="lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
          {/* File Tab Header */}
          <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-mono text-xs font-bold text-emerald-400">
                {selectedFile.path}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{selectedFile.description}</div>
            </div>

            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code Body */}
          <pre className="p-4 text-slate-200 font-mono text-xs leading-relaxed overflow-x-auto max-h-[550px] overflow-y-auto selection:bg-emerald-500 selection:text-black">
            <code>{selectedFile.content}</code>
          </pre>
        </div>
      </div>

      {/* Eclipse Setup Guide & Run Instructions */}
      <div id="instructions" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-bold text-slate-900 text-base">
          <BookOpen className="w-5 h-5 text-emerald-600" />
          <span>Step-by-Step Eclipse IDE Import &amp; MySQL Setup Guide</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
            <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white inline-flex items-center justify-center text-[10px]">
                1
              </span>
              <span>MySQL Database Setup</span>
            </div>
            <p>1. Start your local MySQL service on default port <code>3306</code>.</p>
            <p>2. Create database and load the schema from <code>src/main/resources/schema.sql</code>:</p>
            <div className="p-2 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[10px]">
              mysql -u root -p &lt; schema.sql
            </div>
            <p>3. Update <code>application.properties</code> with your MySQL username and password.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
            <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white inline-flex items-center justify-center text-[10px]">
                2
              </span>
              <span>Import Project into Eclipse</span>
            </div>
            <p>1. Open Eclipse IDE for Enterprise Java Developers.</p>
            <p>2. Click <strong>File &rarr; Import...</strong></p>
            <p>3. Select <strong>Maven &rarr; Existing Maven Projects</strong> and click Next.</p>
            <p>4. Browse to the extracted ZIP root directory containing <code>pom.xml</code>.</p>
            <p>5. Click <strong>Finish</strong> and allow Eclipse m2e to resolve dependencies.</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
            <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white inline-flex items-center justify-center text-[10px]">
                3
              </span>
              <span>Run &amp; Present Demo</span>
            </div>
            <p>1. Right-click <code>BloodBankApplication.java</code> in Eclipse Package Explorer.</p>
            <p>2. Choose <strong>Run As &rarr; Spring Boot App</strong>.</p>
            <p>3. Or from terminal run:</p>
            <div className="p-2 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[10px]">
              mvn clean spring-boot:run
            </div>
            <p>4. Open your browser at <code>http://localhost:8080</code></p>
          </div>
        </div>

        {/* Feature Matrix / Completed vs Future */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <h4 className="font-bold text-slate-900 text-sm mb-3">
            Completed Features vs. Future Python ML Enhancements Matrix
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
              <div className="font-bold text-emerald-900 mb-1 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Fully Completed &amp; Functional in Java Spring Boot:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-emerald-800">
                <li>Spring Security 6 with BCrypt hashing and 3 user roles</li>
                <li>Jakarta Bean Validation for donor and request integrity</li>
                <li>Atomic inventory management with negative quantity prevention</li>
                <li>Java-compatible emergency donor ranking algorithm</li>
                <li>Moving-average time series demand forecast baseline</li>
                <li>Complete MySQL 8.0 DDL with indexes, transactions, and triggers</li>
              </ul>
            </div>

            <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl">
              <div className="font-bold text-purple-900 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Defined Python ML REST Integration Extensions:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-purple-800">
                <li>XGBoost &amp; LSTM regression microservice via REST</li>
                <li>Real-time weather and regional trauma surge weighting</li>
                <li>Automated SMS gateway (Twilio / AWS SNS) trigger contracts</li>
                <li>Hospital electronic health record (HL7 / FHIR) export pipeline</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
