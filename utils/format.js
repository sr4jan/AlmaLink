export const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateString;
    }
  };
  
  export const formatCurrency = (amount) => {
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    } catch (error) {
      console.error('Currency formatting error:', error);
      return `₹${amount}`;
    }
  };
  
  export const getCurrentUTCDateTime = () => {
    return new Date().toISOString();
  };
  
  export const calculateStats = (donations) => {
    try {
      const totalAmount = donations.reduce((sum, d) => sum + (d.amount || 0), 0);
      const monthlyDonors = donations.filter(d => d.recurring).length;
      
      return {
        totalAmount,
        totalDonors: donations.length,
        monthlyDonors
      };
    } catch (error) {
      console.error('Stats calculation error:', error);
      return {
        totalAmount: 0,
        totalDonors: 0,
        monthlyDonors: 0
      };
    }
  };