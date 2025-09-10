#!/data/data/com.termux/files/usr/bin/bash

# -------- CONFIG --------
JOB_ID=1
SCRIPT_PATH="$HOME/affiliate-automation/run-affiliate.sh"
LOG_FILE="$HOME/affiliate-automation/job.log"
INTERVAL_MS=300000  # 5 minutes
# ------------------------

echo "===== TERMUX JOB DASHBOARD ====="
echo

# 1. Show existing jobs
echo "Current scheduled jobs:"
termux-job-scheduler --show
echo

# 2. Ask if user wants to remove old job
read -p "Do you want to remove job ID $JOB_ID if it exists? (y/n): " REMOVE
if [[ "$REMOVE" == "y" || "$REMOVE" == "Y" ]]; then
    termux-job-scheduler --remove --job-id $JOB_ID
    echo "Job $JOB_ID removed."
fi

# 3. Make script executable
chmod +x $SCRIPT_PATH

# 4. Schedule the job
termux-job-scheduler --job-id $JOB_ID --period-ms $INTERVAL_MS --script $SCRIPT_PATH
echo "Job $JOB_ID scheduled every $(($INTERVAL_MS / 60000)) minutes."

# 5. Add logging to the script (if not already)
if ! grep -q "echo .* >> $LOG_FILE" "$SCRIPT_PATH"; then
    echo "echo \"\$(date): script ran\" >> $LOG_FILE" >> $SCRIPT_PATH
    echo "Logging added to $SCRIPT_PATH -> $LOG_FILE"
fi

echo
echo "===== DASHBOARD READY ====="
echo "Check logs with: cat $LOG_FILE"
echo "==================================="
