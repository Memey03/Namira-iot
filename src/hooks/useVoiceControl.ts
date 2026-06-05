import { useState, useEffect, useRef } from 'react';

// Extend Window interface for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function useVoiceControl(
  onCommandRecognized: (command: string) => void,
  readSensorData: () => void
) {
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'id-ID'; // Indonesian as per requested commands

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript.toLowerCase();
        setLastTranscript(transcript);
        
        switch(transcript.trim()) {
           case 'relay 1':
           case 'relay satu':
             onCommandRecognized('1');
             break;
           case 'relay 2':
           case 'relay dua':
             onCommandRecognized('2');
             break;
           case 'relay 3':
           case 'relay tiga':
             onCommandRecognized('3');
             break;
           case 'relay 4':
           case 'relay empat':
             onCommandRecognized('4');
             break;
           case 'semua nyala':
             onCommandRecognized('ON');
             break;
           case 'semua mati':
             onCommandRecognized('OFF');
             break;
           case 'pola 1':
           case 'pola satu':
             onCommandRecognized('POLA1');
             break;
           case 'pola 2':
           case 'pola dua':
             onCommandRecognized('POLA2');
             break;
           case 'stop':
             onCommandRecognized('STOP');
             break;
           case 'baca sensor':
             readSensorData();
             break;
           default:
             break;
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onCommandRecognized, readSensorData]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
       try {
        recognitionRef.current?.start();
       } catch (e) {
           console.error("Failed to start recognition", e);
       }
    }
  };

  return { isListening, toggleListening, lastTranscript };
}
