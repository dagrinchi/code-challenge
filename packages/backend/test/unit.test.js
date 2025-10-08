import { expect } from 'chai';

describe('Unit Tests', () => {
  
  function parseFileResponse(filename, csvData) {
    try {
      if (!csvData || csvData.trim() === '') {
        return {
          file: filename,
          lines: []
        };
      }

      const lines = csvData.trim().split('\n');
      const dataLines = lines.slice(1);
      const validLines = [];
      
      dataLines.forEach((line, index) => {
        if (!line.trim()) return;
        
        const parts = line.split(',');
        
        if (parts.length >= 4) {
          const text = parts[1]?.trim();
          const numberStr = parts[2]?.trim();
          const hex = parts[3]?.trim();
          
          if (text && numberStr && !isNaN(parseInt(numberStr))) {
            validLines.push({
              text: text,
              number: parseInt(numberStr),
              hex: hex || ''
            });
          }
        }
      });

      return {
        file: filename,
        lines: validLines
      };
      
    } catch (error) {
      return {
        file: filename,
        lines: []
      };
    }
  }

  describe('parseFileResponse function', () => {
    
    it('debería parsear datos CSV válidos correctamente', () => {
      const csvData = `file,text,number,hex
test.csv,Hello,123,abc123
test.csv,World,456,def456`;
      
      const result = parseFileResponse('test.csv', csvData);
      
      expect(result).to.have.property('file', 'test.csv');
      expect(result).to.have.property('lines');
      expect(result.lines).to.have.length(2);
      
      expect(result.lines[0]).to.deep.equal({
        text: 'Hello',
        number: 123,
        hex: 'abc123'
      });
      
      expect(result.lines[1]).to.deep.equal({
        text: 'World',
        number: 456,
        hex: 'def456'
      });
    });

    it('debería manejar archivos vacíos', () => {
      const result = parseFileResponse('empty.csv', '');
      
      expect(result).to.have.property('file', 'empty.csv');
      expect(result).to.have.property('lines');
      expect(result.lines).to.have.length(0);
    });

    it('debería descartar líneas con datos insuficientes', () => {
      const csvData = `file,text,number,hex
test.csv,Hello,123,abc123
test.csv,Incomplete
test.csv,World,456,def456`;
      
      const result = parseFileResponse('test.csv', csvData);
      
      expect(result.lines).to.have.length(2);
      expect(result.lines[0].text).to.equal('Hello');
      expect(result.lines[1].text).to.equal('World');
    });

    it('debería descartar líneas con números inválidos', () => {
      const csvData = `file,text,number,hex
test.csv,Hello,123,abc123
test.csv,Invalid,notanumber,def456
test.csv,World,456,def456`;
      
      const result = parseFileResponse('test.csv', csvData);
      
      expect(result.lines).to.have.length(2);
      expect(result.lines[0].text).to.equal('Hello');
      expect(result.lines[1].text).to.equal('World');
    });

    it('debería descartar líneas con texto vacío', () => {
      const csvData = `file,text,number,hex
test.csv,Hello,123,abc123
test.csv,,456,def456
test.csv,World,789,ghi789`;
      
      const result = parseFileResponse('test.csv', csvData);
      
      expect(result.lines).to.have.length(2);
      expect(result.lines[0].text).to.equal('Hello');
      expect(result.lines[1].text).to.equal('World');
    });

    it('debería manejar hex vacío pero mantener la línea si text y number son válidos', () => {
      const csvData = `file,text,number,hex
test.csv,Hello,123,
test.csv,World,456,def456`;
      
      const result = parseFileResponse('test.csv', csvData);
      
      expect(result.lines).to.have.length(2);
      expect(result.lines[0]).to.deep.equal({
        text: 'Hello',
        number: 123,
        hex: ''
      });
    });

    it('debería manejar líneas vacías en el CSV', () => {
      const csvData = `file,text,number,hex
test.csv,Hello,123,abc123

test.csv,World,456,def456`;
      
      const result = parseFileResponse('test.csv', csvData);
      
      expect(result.lines).to.have.length(2);
      expect(result.lines[0].text).to.equal('Hello');
      expect(result.lines[1].text).to.equal('World');
    });

    it('debería convertir números correctamente', () => {
      const csvData = `file,text,number,hex
test.csv,Test,000123,abc
test.csv,Test2,456,def`;
      
      const result = parseFileResponse('test.csv', csvData);
      
      expect(result.lines).to.have.length(2);
      expect(result.lines[0].number).to.equal(123);
      expect(result.lines[1].number).to.equal(456);
    });
  });
});