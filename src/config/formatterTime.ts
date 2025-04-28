export function formatEstimatedTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
  
    return `${minutes} minutos ${remainingSeconds} segundos`;


    // const minutes = Math.ceil(seconds / 60);
    // return `${minutes} min`;
  }