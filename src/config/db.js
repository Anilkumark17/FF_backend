const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://bkwqjuolqarnwafxzhma.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrd3FqdW9scWFybndhZnh6aG1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NjQyODIsImV4cCI6MjA4MTM0MDI4Mn0.HHbMSEIf8FHsApWtPeWyApTigJS9H7n-jtH38_yPzeg";
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
