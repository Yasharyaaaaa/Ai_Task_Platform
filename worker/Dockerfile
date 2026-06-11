FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

FROM python:3.11-slim
WORKDIR /app
# Non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
COPY --from=builder /root/.local /home/appuser/.local
COPY worker.py operations.py retry.py ./
RUN chown -R appuser:appgroup /app /home/appuser/.local
USER appuser
# HOME + PYTHONUSERBASE make Python resolve the user-site packages copied above;
# PATH alone only covers console scripts, not imports.
ENV HOME=/home/appuser \
    PYTHONUSERBASE=/home/appuser/.local \
    PATH=/home/appuser/.local/bin:$PATH
CMD ["python", "worker.py"]