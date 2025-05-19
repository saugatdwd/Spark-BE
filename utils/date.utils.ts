export function calculateAge(dob: Date | string) {
    const birthDate = new Date(dob);
    const today = new Date();
  
    let age = today.getFullYear() - birthDate.getFullYear();
  
    // Adjust age if birthday hasn't occurred yet this year
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
  
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }
  
    return age;
  }
  