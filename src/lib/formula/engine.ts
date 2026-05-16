interface FormulaContext {
  row: Record<string, any>;
  allRows?: Record<string, any[]>;
  functions?: Record<string, Function>;
}

export class FormulaEngine {
  private static readonly FUNCTION_PATTERN = /([A-Z_]+)\(([^)]*)\)/g;
  
  static evaluate(expression: string, context: FormulaContext): any {
    try {
      // Sanitize and prepare expression
      let processedExpr = expression;
      
      // Handle function calls
      processedExpr = this.processFunctions(processedExpr, context);
      
      // Handle cross-sheet references like SUM(ALL_33KV_FEEDERS)
      processedExpr = this.processAggregations(processedExpr, context);
      
      // Handle basic arithmetic with safety
      const safeExpr = this.sanitizeExpression(processedExpr);
      
      // Use Function constructor for evaluation (with limited scope)
      const evalFunc = new Function('ctx', `with(ctx) { return ${safeExpr}; }`);
      const result = evalFunc(context);
      
      return isNaN(result) ? null : result;
    } catch (error) {
      console.error('Formula evaluation error:', error);
      return null;
    }
  }

  private static processFunctions(expression: string, context: FormulaContext): string {
    return expression.replace(this.FUNCTION_PATTERN, (match, funcName, args) => {
      const processedArgs = args.split(',').map(arg => arg.trim());
      
      switch (funcName.toUpperCase()) {
        case 'IF':
          const condition = this.evaluate(processedArgs[0], context);
          return condition ? processedArgs[1] : processedArgs[2];
        
        case 'SUM':
          return this.sumAggregation(processedArgs[0], context);
        
        case 'AVG':
          return this.avgAggregation(processedArgs[0], context);
        
        case 'MAX':
          return this.maxAggregation(processedArgs[0], context);
        
        case 'MIN':
          return this.minAggregation(processedArgs[0], context);
        
        default:
          return match;
      }
    });
  }

  private static sumAggregation(target: string, context: FormulaContext): string {
    if (target === 'ALL_33KV_FEEDERS' && context.allRows?.feeders) {
      const sum = context.allRows.feeders.reduce((acc, row) => acc + (Number(row.mw) || 0), 0);
      return sum.toString();
    }
    return '0';
  }

  private static avgAggregation(target: string, context: FormulaContext): string {
    if (target === 'ALL_33KV_FEEDERS' && context.allRows?.feeders) {
      const values = context.allRows.feeders.map(row => Number(row.mw)).filter(v => !isNaN(v));
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      return avg.toString();
    }
    return '0';
  }

  private static maxAggregation(target: string, context: FormulaContext): string {
    if (target === 'ALL_33KV_FEEDERS' && context.allRows?.feeders) {
      const max = Math.max(...context.allRows.feeders.map(row => Number(row.mw) || 0));
      return max.toString();
    }
    return '0';
  }

  private static minAggregation(target: string, context: FormulaContext): string {
    if (target === 'ALL_33KV_FEEDERS' && context.allRows?.feeders) {
      const min = Math.min(...context.allRows.feeders.map(row => Number(row.mw) || Infinity));
      return min === Infinity ? '0' : min.toString();
    }
    return '0';
  }

  private static processAggregations(expression: string, context: FormulaContext): string {
    // Handle direct references to other fields
    const fieldPattern = /([A-Za-z_][A-Za-z0-9_]*)/g;
    return expression.replace(fieldPattern, (match) => {
      if (match in context.row) {
        const value = context.row[match];
        return typeof value === 'number' ? value.toString() : `"${value}"`;
      }
      return match;
    });
  }

  private static sanitizeExpression(expression: string): string {
    // Remove dangerous patterns
    const dangerous = ['__proto__', 'constructor', 'prototype', 'eval', 'document', 'window'];
    for (const term of dangerous) {
      if (expression.includes(term)) {
        throw new Error(`Invalid expression contains restricted term: ${term}`);
      }
    }
    
    // Allow only safe operations
    if (!/^[\d\s+\-*/%()\[\].,"'_a-zA-Z]+$/.test(expression)) {
      throw new Error('Expression contains invalid characters');
    }
    
    return expression;
  }

  static validateFormula(expression: string): { isValid: boolean; error?: string } {
    try {
      // Test with empty context
      this.evaluate(expression, { row: {} });
      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: (error as Error).message };
    }
  }
}
