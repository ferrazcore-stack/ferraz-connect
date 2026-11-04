# ferraz-connect

Camada de importação/exportação e integrações do ecossistema FERRAZ.

## Implementado nesta branch

- Validador inicial de arquivos de entrada para PDF, SVG, DXF ASCII, PNG, JPEG e WEBP.
- Conferência de assinatura real, extensão, MIME declarado e limite de tamanho.
- Rejeição inicial de conteúdo SVG ativo/perigoso.
- Manifesto de recebimento com SHA-256, origem, data, tamanho e status explícito de metadados validados.
- Testes automatizados com Node.js e workflow de CI.

## Limites atuais

O validador não é parser nem antivírus. Não há upload/storage, OCR, extração de cotas, conversão, filas assíncronas, processamento em sandbox ou integração operacional com ferraz-core. O manifesto retorna parserStatus=not_implemented. Nunca interpretar "validado" como "desenho lido" ou "peça fabricável".

## Executar testes

Requisito: Node.js 20+.

```bash
npm test
```

Consulte docs/CAD-CAM-INTEGRACOES.md para os contratos e limites do pipeline.
