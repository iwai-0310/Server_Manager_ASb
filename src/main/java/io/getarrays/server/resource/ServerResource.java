package io.getarrays.server.resource;

import io.getarrays.server.enumeration.Status;
import io.getarrays.server.model.Response;
import io.getarrays.server.model.Server;
import io.getarrays.server.service.ServerService;
import io.getarrays.server.service.implementation.ServerServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Map;

import static java.time.LocalDateTime.now;
import static org.springframework.http.HttpStatus.OK;
import static org.springframework.http.MediaType.IMAGE_PNG_VALUE;

@RestController
@RequestMapping("/server")
@RequiredArgsConstructor
public class ServerResource {
    private final ServerServiceImpl serverService;
    @GetMapping("/list")
    public ResponseEntity<Response> getServers() {
        return ResponseEntity.ok(
                Response.builder()
                        .timestamp(now())
                        .data(Map.of("servers", serverService.list(10)))
                        .message("Server retrieved:")
                        .status(HttpStatus.OK)
                        .build()
        );
    }
    @GetMapping("/ping/{ipAddress}")
    public ResponseEntity<Response> pingServer(@PathVariable("ipAddress") String ipAddress) throws IOException {
        Server server=serverService.ping(ipAddress);
        if(server!=null){
        return ResponseEntity.ok(
                Response.builder()
                        .timestamp(now())
                        .data(Map.of("servers", server))
                        .message(server.getStatus()== Status.SERVER_UP ? "Ping Success":"Ping failed")
                        .status(OK)
                        .build()
        );}
        else{
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Response.builder()
                    .timestamp(now())
                            .message("Error while  pinging the server")
                            .status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .build()
                    );
        }
    }
    @PostMapping("/save")
    public ResponseEntity<Response> saveServer(@RequestBody @Valid Server server) {

        return ResponseEntity.ok(
                Response.builder()
                        .timestamp(now())
                        .data(Map.of("servers", serverService.create(server)))
                        .message("Server created")
                        .status(HttpStatus.CREATED)
                        .build()
        );
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<Response> getServer(@PathVariable("id") Long id)  {
        return ResponseEntity.ok(
                Response.builder()
                        .timestamp(now())
                        .data(Map.of("servers", serverService.get(id)))
                        .message("Server retrieved")
                        .status(HttpStatus.OK)
                        .build()
        );
    }
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Response> deleteServer(@PathVariable("id") Long id)  {
        return ResponseEntity.ok(
                Response.builder()
                        .timestamp(now())
                        .data(Map.of("deleted", serverService.delete(id)))
                        .message("Server deleted")
                        .status(HttpStatus.OK)
                        .build()
        );
    }
    @GetMapping(path ="/image/{fileName}",produces = IMAGE_PNG_VALUE)
    public byte[] deleteServer(@PathVariable("fileName") String fileName) throws IOException {
        return Files.readAllBytes(Paths.get(System.getProperty("user.home")+"/Downloads/images/"+fileName));
    }
}
