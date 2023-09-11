package io.getarrays.server;

import io.getarrays.server.enumeration.Status;
import io.getarrays.server.model.Server;
import io.getarrays.server.repo.ServerRepo;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class ServerApplication {

	public static void main(String[] args)
	{
		SpringApplication.run(ServerApplication.class, args);
	}
	@Bean
	CommandLineRunner run(ServerRepo serverRepo){
		return args ->{
			serverRepo.save(new Server(0,"192.168.1.160","Ubuntu Linux","16 GB","Personal PC",
					"http://localhost:8080/server/image/server2.png", Status.SERVER_UP));
			serverRepo.save(new Server(0,"192.168.1.58","Ubuntu Mint","8 GB","Virtual machine",
					"http://localhost:8080/server/image/server3.png", Status.SERVER_UP));
			serverRepo.save(new Server(0,"192.168.1.123","Windows 10","16 GB","Work PC",
					"http://localhost:8080/server/image/server4.png", Status.SERVER_UP));
			serverRepo.save(new Server(0,"192.168.1.120","kali Linux","16 GB","DUAL BOOT",
					"http://localhost:8080/server/image/server5.png", Status.SERVER_DOWN));

		};
	}
}
